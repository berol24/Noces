"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { useLocale } from "@/lib/locale";
import type { GalleryPhoto } from "@/wedding.config";

export function Gallery() {
  const wedding = useWedding();
  const { t } = useLocale();
  const photos = wedding.photos.gallery.filter((photo) => photo.src);
  const [active, setActive] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (photos.length === 0) return null;

  return (
    <section>
      <Reveal from="left">
        <SectionHeading kicker={t("gallery")} title={t("moments")} />
        <p className="signature">— {wedding.photos.signature} —</p>
      </Reveal>
      <div className="grid">
        {photos.map((photo, index) => (
          <Reveal from={index % 2 ? "right" : "left"} delay={(index % 2) * 140} key={`${photo.src}-${index}`}>
            <button className="portrait-tile" type="button" onClick={() => setActive(photo)}>
              <Frame src={photo.src} alt={photo.place || photo.alt} focus={photo.focus} />
              {photo.place ? <span className="photo-place">{photo.place}</span> : null}
            </button>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="hint">{t("enlarge")}</p>
      </Reveal>
      {active ? createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.alt} onClick={() => setActive(null)}>
          <button className="lightbox-close" type="button" aria-label="Fermer" onClick={() => setActive(null)}>
            ×
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <Frame src={active.src} alt={active.alt} focus={active.focus} />
            {active.place || active.alt ? <figcaption>{active.place || active.alt}</figcaption> : null}
          </figure>
        </div>,
        document.body,
      ) : null}
    </section>
  );
}
