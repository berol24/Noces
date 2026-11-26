import { Router } from "express";
import { z } from "zod";
import { folderLinkFor } from "./drive.js";
import { Wedding } from "../models/Wedding.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const weddingRouter = Router();

const designs = ["classique", "editorial", "jardin", "lin"] as const;

const saveSchema = z.object({
  designId: z.enum(designs),
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
  const raw = `${bride}-et-${groom}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw || "mariage";
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
  const { designId, config } = parsed.data;
  const nextConfig = { ...config, designId, showThemePicker: false };
  const current = await Wedding.findOne({ userId: req.userId });
  let slug = current?.slug;
  if (!slug) {
    const base = slugify(config.couple.bride.firstName, config.couple.groom.firstName);
    const taken = await Wedding.findOne({ slug: base });
    slug = taken ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base;
  }
  const wedding = await Wedding.findOneAndUpdate(
    { userId: req.userId },
    { userId: req.userId, slug, designId, config: nextConfig },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json({ slug: wedding.slug, designId: wedding.designId, config: wedding.config });
});
