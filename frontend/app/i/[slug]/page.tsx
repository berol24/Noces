import { InvitationView } from "@/components/InvitationView";
import { loadPublicWedding } from "@/lib/public-wedding";
import { paletteOf, rootThemeCss } from "@/lib/theme";

export default async function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadPublicWedding(slug);
  const config = loaded ? { ...loaded, drive: { slug, connected: loaded.drive?.connected } } : null;

  return (
    <>
      {config ? <style dangerouslySetInnerHTML={{ __html: rootThemeCss(paletteOf(config)) }} /> : null}
      <InvitationView slug={slug} initial={config} />
    </>
  );
}
