import { FairePartView } from "@/components/FairePartView";
import { loadPublicWedding } from "@/lib/public-wedding";
import { paletteOf, rootThemeCss } from "@/lib/theme";

export default async function InvitationCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await loadPublicWedding(slug);

  return (
    <>
      {config ? <style dangerouslySetInnerHTML={{ __html: rootThemeCss(paletteOf(config)) }} /> : null}
      <FairePartView slug={slug} initial={config} />
    </>
  );
}
