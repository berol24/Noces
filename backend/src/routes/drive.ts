import { Readable } from "node:stream";
import { Router } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import { driveFor, googleConfigured, oauthClient } from "../google.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Wedding } from "../models/Wedding.js";

export const driveRouter = Router();

const secret = () => process.env.JWT_SECRET || "dev-secret";
const origin = () => process.env.CLIENT_ORIGIN || "http://localhost:3000";

const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif", "image/bmp", "image/heic", "image/heif", "image/tiff"];
const photoExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".heic", ".heif", ".tif", ".tiff"];
const audioTypes = ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg", "audio/wav", "audio/wave", "audio/webm", "audio/x-wav"];

function isPhoto(file: { mimetype?: string; originalname?: string }) {
  const type = (file.mimetype || "").toLowerCase().split(";")[0].trim();
  if (type === "image/svg+xml") return false;
  if (imageTypes.includes(type) || type.startsWith("image/")) return true;
  const name = (file.originalname || "").toLowerCase();
  return photoExtensions.some((ext) => name.endsWith(ext));
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 24 },
  fileFilter: (_req, file, callback) => {
    const name = file.originalname.toLowerCase();
    const audioName = [".mp3", ".m4a", ".aac", ".ogg", ".wav", ".webm"].some((ext) => name.endsWith(ext));
    if (isPhoto(file) || audioTypes.includes(file.mimetype) || audioName) callback(null, true);
    else callback(new Error(`type:${file.mimetype || "inconnu"}`));
  },
});

function acceptPhotos(req: AuthRequest, res: import("express").Response, next: import("express").NextFunction) {
  upload.array("photos", 24)(req, res, (error) => {
    if (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      const message = error instanceof Error ? error.message : "";
      if (code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Chaque photo doit faire moins de 20 Mo." });
        return;
      }
      if (code === "LIMIT_FILE_COUNT" || code === "LIMIT_UNEXPECTED_FILE") {
        res.status(400).json({ error: "Ajoutez au plus 24 photos à la fois." });
        return;
      }
      if (message.startsWith("type:")) {
        res.status(400).json({ error: "Format non accepté. Choisissez des photos JPEG, PNG ou WebP." });
        return;
      }
      res.status(400).json({ error: "Choisissez une image ou une musique (mp3, m4a, wav), 20 Mo maximum." });
      return;
    }
    next();
  });
}

function googleText(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  let code = "";
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as { response?: { data?: { error?: string; error_description?: string } } }).response?.data;
    code = `${data?.error || ""} ${data?.error_description || ""}`;
  }
  return `${message} ${code}`.toLowerCase();
}

function googleExpired(error: unknown) {
  const text = googleText(error);
  return text.includes("invalid_grant") || text.includes("unauthorized_client") || text.includes("invalid_client");
}

function googleMessage(error: unknown) {
  if (googleExpired(error)) return "La connexion Google Drive n'est plus valable. Reconnectez le compte, puis renvoyez la photo.";
  return "Google Drive a refusé l'opération.";
}

async function forgetExpiredToken(userId: unknown, error: unknown) {
  if (!userId || !googleExpired(error)) return;
  await User.updateOne({ _id: userId }, { googleRefreshToken: "" });
}

async function ownerToken(userId: unknown) {
  const user = await User.findById(userId).select("+googleRefreshToken");
  return user?.googleRefreshToken || "";
}

type DriveWedding = {
  slug: string;
  userId?: unknown;
  driveFolderId?: string;
  driveFolderUrl?: string;
  driveFiles?: { id: string; name: string; mimeType: string; guest?: boolean }[];
  save: () => Promise<unknown>;
};

export async function folderLinkFor(wedding: DriveWedding) {
  if (wedding.driveFolderUrl) return wedding.driveFolderUrl;
  const token = await ownerToken(wedding.userId);
  if (!token) return "";
  const drive = driveFor(token);
  let folderId = wedding.driveFolderId || "";
  if (!folderId) {
    const created = await drive.files.create({
      requestBody: {
        name: `Noces — ${wedding.slug}`,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    folderId = created.data.id || "";
    if (!folderId) throw new Error("dossier");
    wedding.driveFolderId = folderId;
  }
  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: { role: "writer", type: "anyone", allowFileDiscovery: false },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const text = message.toLowerCase();
    if (!text.includes("already exists") && !text.includes("duplicate")) throw error;
  }
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  wedding.driveFolderUrl = url;
  await wedding.save();
  return url;
}

async function dropMissingGuestPhotos(wedding: DriveWedding, refreshToken: string) {
  const folderId = wedding.driveFolderId;
  if (!folderId) return;
  const drive = driveFor(refreshToken);
  const live = new Set<string>();
  let pageToken: string | undefined;
  do {
    const listed = await drive.files.list({
      q: `'${folderId.replace(/'/g, "")}' in parents and trashed = false`,
      fields: "nextPageToken, files(id)",
      pageSize: 100,
      pageToken,
      spaces: "drive",
    });
    for (const file of listed.data.files || []) {
      if (file.id) live.add(file.id);
    }
    pageToken = listed.data.nextPageToken || undefined;
  } while (pageToken);

  const current = wedding.driveFiles || [];
  const kept = current.filter((file) => !file.guest || live.has(file.id));
  if (kept.length === current.length) return;
  wedding.driveFiles = kept;
  await wedding.save();
}

async function storePhotos(wedding: DriveWedding, refreshToken: string, files: Express.Multer.File[], guest = false) {
  const drive = driveFor(refreshToken);
  let folderId = wedding.driveFolderId || "";
  if (!folderId) {
    await folderLinkFor(wedding);
    folderId = wedding.driveFolderId || "";
  }
  if (!folderId) throw new Error("dossier");

  const saved: { id: string; name: string }[] = [];
  wedding.driveFiles = wedding.driveFiles || [];
  for (const file of files) {
    const created = await drive.files.create({
      requestBody: { name: file.originalname, parents: [folderId] },
      media: { mimeType: file.mimetype, body: Readable.from(file.buffer) },
      fields: "id, name",
    });
    if (!created.data.id) continue;
    wedding.driveFiles.push({
      id: created.data.id,
      name: created.data.name || file.originalname,
      mimeType: file.mimetype,
      guest,
    });
    saved.push({ id: created.data.id, name: created.data.name || file.originalname });
  }
  await wedding.save();
  return saved;
}

driveRouter.get("/status", requireAuth, async (req: AuthRequest, res) => {
  const token = await ownerToken(req.userId);
  res.json({ configured: googleConfigured(), connected: Boolean(token) });
});

driveRouter.delete("/disconnect", requireAuth, async (req: AuthRequest, res) => {
  const token = await ownerToken(req.userId);
  await User.updateOne({ _id: req.userId }, { googleRefreshToken: "" });
  if (token) {
    try {
      await oauthClient().revokeToken(token);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }
  res.json({ connected: false });
});

driveRouter.get("/connect", (req, res) => {
  if (!googleConfigured()) {
    res.status(400).json({
      error: "Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans backend/.env, puis redémarrez l'API.",
    });
    return;
  }
  const token = typeof req.query.token === "string" ? req.query.token : "";
  try {
    const payload = jwt.verify(token, secret());
    if (typeof payload === "string" || !payload.sub || payload.typ === "refresh") throw new Error("bad");
    const state = jwt.sign({ sub: payload.sub, purpose: "drive" }, secret(), { expiresIn: "10m" });
    const url = oauthClient().generateAuthUrl({
      access_type: "offline",
      prompt: "select_account consent",
      scope: ["https://www.googleapis.com/auth/drive.file"],
      state,
    });
    res.redirect(url);
  } catch {
    res.status(401).json({ error: "Connexion requise" });
  }
});

driveRouter.get("/callback", async (req, res) => {
  const fail = (message: string) => {
    res.redirect(`${origin()}/?drive=error&message=${encodeURIComponent(message)}`);
  };
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  if (!code || !state) {
    fail("Autorisation Google annulée.");
    return;
  }
  try {
    const payload = jwt.verify(state, secret());
    if (typeof payload === "string" || payload.purpose !== "drive" || !payload.sub) {
      fail("Session expirée. Reconnectez Google Drive.");
      return;
    }
    const client = oauthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      fail("Google n'a pas renvoyé d'autorisation durable. Réessayez.");
      return;
    }
    await User.updateOne({ _id: payload.sub }, { googleRefreshToken: tokens.refresh_token });
    const wedding = await Wedding.findOne({ userId: payload.sub });
    if (wedding) {
      try {
        await folderLinkFor(wedding);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
    res.redirect(`${origin()}/?drive=connected`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    fail("Connexion à Google Drive impossible.");
  }
});

driveRouter.get("/me/link", requireAuth, async (req: AuthRequest, res) => {
  try {
    const wedding = await Wedding.findOne({ userId: req.userId });
    if (!wedding) {
      res.json({ url: "" });
      return;
    }
    const url = await folderLinkFor(wedding);
    res.json({ url });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    await forgetExpiredToken(req.userId, error);
    res.status(502).json({ error: googleMessage(error) });
  }
});

driveRouter.get("/public/:slug/photos", async (req, res) => {
  const wedding = await Wedding.findOne({ slug: req.params.slug });
  if (!wedding) {
    res.status(404).json({ error: "Invitation introuvable" });
    return;
  }
  const token = await ownerToken(wedding.userId);
  if (token) {
    try {
      await dropMissingGuestPhotos(wedding, token);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }
  const photos = (wedding.driveFiles || []).filter((file) => file.guest && String(file.mimeType || "").startsWith("image/"));
  res.json({
    ready: Boolean(token),
    photos: photos.map((file) => ({ id: file.id, name: file.name })),
  });
});

driveRouter.get("/public/:slug", async (req, res) => {
  const wedding = await Wedding.findOne({ slug: req.params.slug });
  if (!wedding) {
    res.status(404).json({ error: "Invitation introuvable" });
    return;
  }
  res.json({ folderUrl: wedding.driveFolderUrl || "" });
});

driveRouter.post("/me", requireAuth, acceptPhotos, async (req: AuthRequest, res) => {
  try {
    const wedding = await Wedding.findOne({ userId: req.userId });
    if (!wedding) {
      res.status(400).json({ error: "Enregistrez d'abord la fiche du mariage." });
      return;
    }
    const token = await ownerToken(req.userId);
    if (!token) {
      res.status(400).json({ error: "Connectez Google Drive avant d'envoyer des photos." });
      return;
    }
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) {
      res.status(400).json({ error: "Choisissez au moins une photo." });
      return;
    }
    const photos = await storePhotos(wedding, token, files);
    res.json({ photos });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    await forgetExpiredToken(req.userId, error);
    res.status(502).json({ error: googleMessage(error) });
  }
});

driveRouter.post("/public/:slug", acceptPhotos, async (req, res) => {
  const wedding = await Wedding.findOne({ slug: req.params.slug });
  if (!wedding) {
    res.status(404).json({ error: "Invitation introuvable" });
    return;
  }
  try {
    const token = await ownerToken(wedding.userId);
    if (!token) {
      res.status(400).json({ error: "Le couple n'a pas encore connecté Google Drive." });
      return;
    }
    const files = ((req.files as Express.Multer.File[]) || []).filter((file) => isPhoto(file));
    if (!files.length) {
      res.status(400).json({ error: "Choisissez au moins une photo." });
      return;
    }
    if ((wedding.driveFiles?.length || 0) + files.length > 80) {
      res.status(400).json({ error: "Le dossier contient déjà le maximum de photos." });
      return;
    }
    const photos = await storePhotos(wedding, token, files, true);
    res.json({ photos });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    await forgetExpiredToken(wedding.userId, error);
    res.status(502).json({ error: googleMessage(error) });
  }
});

driveRouter.get("/files/:id", async (req, res) => {
  const wedding = await Wedding.findOne({ "driveFiles.id": req.params.id });
  const file = wedding?.driveFiles?.find((item) => item.id === req.params.id);
  if (!wedding || !file) {
    res.status(404).json({ error: "Photo introuvable" });
    return;
  }
  const token = await ownerToken(wedding.userId);
  if (!token) {
    res.status(404).json({ error: "Photo introuvable" });
    return;
  }
  try {
    const drive = driveFor(token);
    const media = await drive.files.get({ fileId: file.id, alt: "media" }, { responseType: "stream" });
    res.setHeader("Content-Type", file.mimeType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    media.data.on("error", () => {
      if (!res.headersSent) res.status(502).end();
      else res.end();
    });
    media.data.pipe(res);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    res.status(502).json({ error: "Photo inaccessible" });
  }
});
