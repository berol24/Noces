"use client";

import { useWedding } from "@/components/wedding-context";
import { DiamondRule, Monogram } from "@/components/art";
import { Frame } from "@/components/Frame";
import { coupleLine, familiesLine, fullDate, numericDate } from "@/lib/text";

export function FairePart() {
  const wedding = useWedding();
  const { bride, groom, nameOrder, monogram } = wedding.couple;
  const first = nameOrder === "groom-bride" ? groom : bride;
  const second = nameOrder === "groom-bride" ? bride : groom;

  if (wedding.fairePart.image) {
    return (
      <div className="poster-wrap">
        <img src={wedding.fairePart.image} alt={`Faire-part de ${coupleLine(wedding)}`} style={{ width: "min(440px, calc(100% - 32px))", display: "block", margin: "0 auto" }} />
      </div>
    );
  }

  return (
    <article className="poster">
      <p className="kicker">· Save the date ·</p>
      {wedding.photos.hero.src ? (
        <div className="poster-photo">
          <Frame src={wedding.photos.hero.src} alt={wedding.photos.hero.alt} />
        </div>
      ) : (
        <Monogram top={monogram.top} bottom={monogram.bottom} size={132} />
      )}
      <h1 className="names">
        {first.firstName}
        <em>&</em>
        {second.firstName}
      </h1>
      <p className="families">{familiesLine(wedding)}</p>
      <DiamondRule />
      <p className="when">
        {fullDate(wedding)} · {wedding.date.city}
      </p>
      <p className="invite">{wedding.invitation}</p>
      {wedding.ceremonies.map((ceremony) => (
        <div className="venue" key={`${ceremony.title}-${ceremony.time}`}>
          <h3>✦ {ceremony.title} · {ceremony.time} ✦</h3>
          <p className="place">{ceremony.venue}</p>
          <p className="address">{ceremony.address}</p>
        </div>
      ))}
      {wedding.dressCode.enabled ? (
        <>
          <p className="kicker" style={{ marginTop: 26 }}>Dress code</p>
          <div className="swatches">
            {wedding.dressCode.colors.map((color) => (
              <div className="swatch" key={color.name}>
                <b style={{ background: color.hex }} />
                <span>{color.name}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <p className="footer-line">{numericDate(wedding)}</p>
    </article>
  );
}
