import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { mailConfigured, sendResetMail } from "../mail.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { issueSession, revokeSession, revokeSessions, rotateSession } from "../tokens.js";

export const authRouter = Router();

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

authRouter.post("/register", async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email invalide ou mot de passe trop court (8 caractères)" });
    return;
  }
  const email = parsed.data.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    return;
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({ email, passwordHash, name: parsed.data.name || "" });
  const session = await issueSession(String(user._id));
  res.status(201).json({
    ...session,
    user: { id: user._id, email: user.email, name: user.name },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(401).json({ error: "Connexion requise" });
    return;
  }
  res.json({ user: { email: user.email, name: user.name } });
});

authRouter.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  const parsed = z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().min(8).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Nom, e-mail ou mot de passe invalide (8 caractères minimum)" });
    return;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(401).json({ error: "Connexion requise" });
    return;
  }
  if (parsed.data.name !== undefined) user.name = parsed.data.name.trim();
  if (parsed.data.email) {
    const email = parsed.data.email.toLowerCase();
    if (email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) {
        res.status(409).json({ error: "Un compte existe déjà avec cet email" });
        return;
      }
      user.email = email;
    }
  }
  if (parsed.data.password) {
    user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await revokeSessions(String(user._id));
  }
  await user.save();
  const session = parsed.data.password ? await issueSession(String(user._id)) : {};
  res.json({ ...session, user: { email: user.email, name: user.name } });
});

authRouter.post("/login", async (req, res) => {
  const parsed = credentials.omit({ name: true }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email ou mot de passe invalide" });
    return;
  }
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }
  const session = await issueSession(String(user._id));
  res.json({
    ...session,
    user: { id: user._id, email: user.email, name: user.name },
  });
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = String(req.body?.refreshToken || "");
  if (!refreshToken) {
    res.status(401).json({ error: "Session expirée" });
    return;
  }
  try {
    const session = await rotateSession(refreshToken);
    res.json(session);
  } catch {
    res.status(401).json({ error: "Session expirée" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = String(req.body?.refreshToken || "");
  if (refreshToken) await revokeSession(refreshToken);
  res.json({ ok: true });
});

authRouter.post("/forgot", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email.includes("@")) {
    res.status(400).json({ error: "Email invalide" });
    return;
  }
  if (!mailConfigured()) {
    res.status(503).json({
      error: "L'envoi d'e-mail n'est pas configuré. Ajoutez SMTP_USER et SMTP_PASS dans backend/.env, puis redémarrez l'API.",
    });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.json({ ok: true });
    return;
  }
  const token = crypto.randomBytes(32).toString("hex");
  user.set("resetTokenHash", crypto.createHash("sha256").update(token).digest("hex"));
  user.set("resetTokenExpires", new Date(Date.now() + 30 * 60 * 1000));
  await user.save();
  const origin = (process.env.CLIENT_ORIGIN || "http://localhost:3000").replace(/^"|"$/g, "").replace(/\/$/, "");
  try {
    await sendResetMail(user.email, `${origin}/?reset=${token}`);
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: "L'e-mail n'a pas pu être envoyé." });
    return;
  }
  res.json({ ok: true });
});

authRouter.post("/password", async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email invalide ou mot de passe trop court (8 caractères)" });
    return;
  }
  const email = parsed.data.email.toLowerCase();
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ error: "Aucun compte avec cet e-mail" });
    return;
  }
  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.set("resetTokenHash", "");
  user.set("resetTokenExpires", null);
  user.set("sessions", []);
  await user.save();
  res.json({ ok: true });
});

authRouter.post("/reset", async (req, res) => {
  const parsed = z
    .object({
      token: z.string().min(20),
      email: z.string().email(),
      password: z.string().min(8),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email invalide ou mot de passe trop court (8 caractères)" });
    return;
  }
  const resetTokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const user = await User.findOne({
    resetTokenHash,
    resetTokenExpires: { $gt: new Date() },
  }).select("+resetTokenHash +resetTokenExpires");
  if (!user || user.email !== parsed.data.email.toLowerCase()) {
    res.status(400).json({ error: "Cet e-mail ne correspond pas à un lien valable" });
    return;
  }
  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.set("resetTokenHash", "");
  user.set("resetTokenExpires", null);
  user.set("sessions", []);
  await user.save();
  res.json({ ok: true });
});
