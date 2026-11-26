import { Router } from "express";
import { z } from "zod";
import { folderLinkFor } from "./drive.js";
import { Wedding } from "../models/Wedding.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const weddingRouter = Router();

const designs = ["classique", "editorial", "jardin", "lin"] as const;

const saveSchema = z.object({
  designId: z.enum(designs),
  slug: z.string().optional(),
  config: z
    .object({
      couple: z.object({
        bride: z.object({ firstName: z.string().min(1), lastName: z.string() }),
        groom: z.object({ firstName: z.string().min(1), lastName: z.string() }),
        nameOrder: z.enum(["bride-groom", "groom-bride"]),
        monogram: z.object({ top: z.string().min(1), bottom: z.string().min(1) }),
      }),
      date: z
        .object({
          city: z.string().min(1),
          country: z.string().min(1),
        })
        .passthrough(),
    })
    .passthrough(),
});

function slugify(bride: string, groom: string) {
  return cleanSlug(`${bride}-et-${groom}`);
}

function cleanSlug(value: string) {
  const raw = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw || "";
}

weddingRouter.get("/designs", (_req, res) => {
  res.json({
    designs: [
      { id: "classique", name: "Classique", text: "Invitation centrée, photo en arche, ornements." },
      { id: "editorial", name: "Éditorial", text: "Grands noms, photo large, lecture alignée à gauche." },
      { id: "jardin", name: "Jardin", text: "Portrait rond, feuillage plus présent." },
      { id: "lin", name: "Lin", text: "Beaucoup d'espace, traits fins, peu d'ornements." },
    ],
  });
});

weddingRouter.get("/public/:slug", async (req, res) => {
  const wedding = await Wedding.findOne({ slug: req.params.slug });
  if (!wedding) {
    res.status(404).json({ error: "Invitation introuvable" });
    return;
  }
  let folderUrl = wedding.driveFolderUrl || "";
  if (!folderUrl) {
    try {
      folderUrl = await folderLinkFor(wedding);
    } catch (error) {
      console.error(error);
    }
  }
  const config = JSON.parse(JSON.stringify(wedding.config));
  config.drive = { slug: wedding.slug, connected: Boolean(folderUrl) };
  res.json({ slug: wedding.slug, designId: wedding.designId, config });
});

weddingRouter.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const wedding = await Wedding.findOne({ userId: req.userId });
  res.json({ wedding });
});

weddingRouter.put("/me", requireAuth, async (req: AuthRequest, res) => {
  const parsed = saveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Renseignez les prénoms, la ville et le pays" });
    return;
  }
  const { designId, config, slug: requested } = parsed.data;
  const nextConfig = { ...config, designId, showThemePicker: false };
  const current = await Wedding.findOne({ userId: req.userId });
  const fallback = slugify(config.couple.bride.firstName, config.couple.groom.firstName);
  const wanted = cleanSlug(requested || "") || current?.slug || fallback;
  const taken = await Wedding.findOne({ slug: wanted, userId: { $ne: req.userId } });
  if (taken) {
    res.status(409).json({ error: "Ce nom de lien est déjà utilisé" });
    return;
  }
  const wedding = await Wedding.findOneAndUpdate(
    { userId: req.userId },
    { userId: req.userId, slug: wanted, designId, config: nextConfig },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json({ slug: wedding.slug, designId: wedding.designId, config: wedding.config });
});
