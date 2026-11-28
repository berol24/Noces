"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";
import { coupleLine, footerLine, numericDate } from "@/lib/text";
import { useLocale } from "@/lib/locale";
import { OwnWedding } from "@/components/OwnWedding";
import { EdgeMarquee } from "@/components/EdgeMarquee";

export function Closing() {
  const wedding = useWedding();
  const { t } = useLocale();
  const album = wedding.guestAlbum;
  const slug = wedding.drive?.slug || "";

  return (
    <>
      {wedding.gifts.enabled ? (
        <section>
          <Reveal from="right">
            <SectionHeading kicker={t("gifts")} title={wedding.gifts.subtitle} />
          </Reveal>
          {wedding.gifts.text ? (
            <Reveal from="left">
              <p className="prose">{wedding.gifts.text}</p>
            </Reveal>
          ) : null}
          {wedding.gifts.footnote ? (
            <Reveal from="right">
              <p className="footnote">{wedding.gifts.footnote}</p>
            </Reveal>
          ) : null}
        </section>
      ) : null}
      <footer className="footer">
        <Reveal from="left">
          <h2 className="names">{coupleLine(wedding)}</h2>
          <p className="mini-date">{numericDate(wedding)}</p>
        </Reveal>
        {slug ? (
          <Reveal from="right">
            <p className="track" style={{ fontSize: 28 }}>{album.title || "Partagez vos photos du grand jour"}</p>
            {album.text ? <p className="prose">{album.text}</p> : null}
            <a className="line-btn" href={`/i/${slug}/photos`}>
              {album.button || "Ajouter mes photos"}
            </a>
          </Reveal>
        ) : null}
        <Reveal from="left">
          <p className="families" style={{ marginTop: 28 }}>{wedding.families.filter(Boolean).join(" · ")}</p>
          <p className="footer-line">{footerLine(wedding)}</p>
          <EdgeMarquee band />
          <aside className="site-credit no-print">
            <p>Pour un site comme celui-ci</p>
            <a href={`https://wa.me/237687962949?text=${encodeURIComponent(`Bonjour, j'aimerais un site d'invitation comme celui de ${coupleLine(wedding)}.`)}`} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.9c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.61-2.88-1.25-4.76-4.15-4.9-4.35-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.26-.28.57-.35.76-.35h.55c.17 0 .41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.41.5-.14.14-.28.29-.12.56.16.28.72 1.19 1.55 1.93 1.07.95 1.96 1.25 2.24 1.39.28.14.44.12.6-.07.17-.19.7-.81.88-1.09.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.46.21.53.33.07.12.07.68-.17 1.36z" />
              </svg>
              +237 6 87 96 29 49
            </a>
            <a href={`mailto:berolbertindjomo@gmail.com?subject=${encodeURIComponent("Un site d'invitation")}&body=${encodeURIComponent(`Bonjour, j'aimerais un site d'invitation comme celui de ${coupleLine(wedding)}.`)}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2.2V18h18V7.2l-9 5.4-9-5.4zM5.2 7 12 11.1 18.8 7H5.2z" />
              </svg>
              berolbertindjomo@gmail.com
            </a>
          </aside>
        </Reveal>
        <OwnWedding />
      </footer>
    </>
  );
}
