import { GuestNotePage } from "@/components/GuestNotePage";
import { loadPublicWedding } from "@/lib/public-wedding";
import { paletteOf, rootThemeCss } from "@/lib/theme";

export default async function MessagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await loadPublicWedding(slug);

  return (
    <>
      {config ? <style dangerouslySetInnerHTML={{ __html: rootThemeCss(paletteOf(config)) }} /> : null}
      <GuestNotePage slug={slug} initial={config} />
    </>
  );
}
