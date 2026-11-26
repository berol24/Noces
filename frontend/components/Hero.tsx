"use client";

import { useWedding } from "@/components/wedding-context";
import { DiamondRule, Monogram, Rings } from "@/components/art";
import { CountdownReadout } from "@/components/Countdown";
import { Frame } from "@/components/Frame";
import { familiesLine } from "@/lib/text";

export function Hero() {
  const wedding = useWedding();
  const { bride, groom, nameOrder, monogram } = wedding.couple;
  const first = nameOrder === "groom-bride" ? groom : bride;
  const second = nameOrder === "groom-bride" ? bride : groom;
  const hero = wedding.photos.hero;

  return (
    <section className="hero-screen hero-in">
      <div className="hero-photo">
        <div className="arch">
          {hero.src ? (
            <Frame src={hero.src} alt={hero.alt} focus={hero.focus} />
          ) : (
            <div className="arch-fallback">
              <Monogram top={monogram.top} bottom={monogram.bottom} size={120} />
            </div>
          )}
        </div>
      </div>
      <div className="hero-veil" aria-hidden="true" />
      <div className="hero-intro slide-right">
        <Rings />
        <p className="kicker">— Nous nous marions —</p>
        <p className="families">{familiesLine(wedding)}</p>
        <h1 className="names">
          <span>{first.firstName}</span>
          <em>&</em>
          <span>{second.firstName}</span>
        </h1>
      </div>
      <div className="hero-foot slide-left">
        <CountdownReadout />
        <div className="date-lockup">
          <p className="weekday">{wedding.date.weekday}</p>
          <strong>{wedding.date.day}</strong>
          <p className="weekday">
            {wedding.date.month} {wedding.date.year}
          </p>
          <p className="city">{wedding.date.city}</p>
        </div>
        <DiamondRule />
        <p className="hint">Scrollez ↓</p>
      </div>
    </section>
  );
}
