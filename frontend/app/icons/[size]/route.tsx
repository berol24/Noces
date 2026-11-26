import { ImageResponse } from "next/og";
import { PwaMark } from "@/lib/pwa-mark";

const sizes: Record<string, number> = { "192": 192, "512": 512 };

export async function GET(_request: Request, context: { params: Promise<{ size: string }> }) {
  const { size } = await context.params;
  const px = sizes[size];
  if (!px) return new Response("Not found", { status: 404 });
  return new ImageResponse(<PwaMark size={px} />, { width: px, height: px });
}
