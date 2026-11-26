"use client";

import { useWedding } from "@/components/wedding-context";
import { SectionHeading } from "@/components/art";
import { Reveal } from "@/components/Reveal";
import { coupleLine, footerLine, numericDate } from "@/lib/text";
import { OwnWedding } from "@/components/OwnWedding";

export function Closing() {
  const wedding = useWedding();
  const album = wedding.guestAlbum;
  const slug = wedding.drive?.slug || "";

  return (
    <>
      {wedding.gifts.enabled ? (
        <section>
          <Reveal from="right">
            <SectionHeading kicker="Cadeaux" title={wedding.gifts.subtitle} />
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
        </Reveal>
        <OwnWedding />
      </footer>
    </>
  );
}
