import type { WeddingConfig } from "@/wedding.config";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function loadPublicWedding(slug: string): Promise<WeddingConfig | null> {
  try {
    const response = await fetch(`${api}/api/weddings/public/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { config?: WeddingConfig };
    return body.config ?? null;
  } catch {
    return null;
  }
}
