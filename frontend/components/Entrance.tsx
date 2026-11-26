"use client";

import { useState } from "react";
import { useWedding } from "@/components/wedding-context";
import { DiamondRule, Leaves, Monogram, Rings } from "@/components/art";
import { useAudio } from "@/components/audio";
import { familiesLine } from "@/lib/text";
import { OwnWedding } from "@/components/OwnWedding";

export function Entrance({
  onEnter,
  themeId,
  onTheme,
}: {
  onEnter: () => void;
  themeId: string;
  onTheme: (id: string) => void;
}) {
  const wedding = useWedding();
  const { playBg } = useAudio();
  const [closing, setClosing] = useState(false);
  const { bride, groom, nameOrder, monogram } = wedding.couple;
  const first = nameOrder === "groom-bride" ? groom : bride;
  const second = nameOrder === "groom-bride" ? bride : groom;

  function enter() {
    if (closing) return;
    playBg();
    setClosing(true);
    window.setTimeout(onEnter, 1280);
  }

  return (
    <div className={`entrance${closing ? " is-closing" : ""}`}>
      <div className="curtain curtain-left" aria-hidden="true" />
      <div className="curtain curtain-right" aria-hidden="true" />
      <Leaves />
      <div className="entrance-inner">
        <Rings />
        <p className="kicker">{wedding.entrance.kicker}</p>
        <Monogram top={monogram.top} bottom={monogram.bottom} />
        <h1 className="names">
          {first.firstName}
          <em>&</em>
          {second.firstName}
        </h1>
        {wedding.entrance.photo ? <img className="entrance-photo" src={wedding.entrance.photo} alt="" /> : null}
        <p className="families">{familiesLine(wedding)}</p>
        <DiamondRule />
        <p className="when">
          {wedding.date.day} {wedding.date.month} {wedding.date.year} · {wedding.date.city}
        </p>
        {wedding.showThemePicker ? (
          <div className="theme-picker">
            <p className="hint">Modèle de couleurs</p>
            <div className="theme-grid" role="listbox" aria-label="Modèles de couleurs">
              {wedding.themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  role="option"
                  aria-selected={theme.id === themeId}
                  className={theme.id === themeId ? "theme-chip on" : "theme-chip"}
                  onClick={() => onTheme(theme.id)}
                >
                  <span className="theme-dots" aria-hidden="true">
                    <i style={{ background: theme.colors.background }} />
                    <i style={{ background: theme.colors.accent }} />
                    <i style={{ background: theme.colors.flower }} />
                  </span>
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <p className="hint">Cliquez ici</p>
        <span className="arrow" aria-hidden="true">
          ↓
        </span>
        <button className="line-btn" type="button" onClick={enter}>
          {wedding.entrance.button} ✦
        </button>
        <span className="arrow" aria-hidden="true">
          ↑
        </span>
        <p className="hint">Cliquez ici</p>
        <OwnWedding />
      </div>
    </div>
  );
}
