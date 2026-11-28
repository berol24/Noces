"use client";

import { useEffect, useState } from "react";
import { useWedding } from "@/components/wedding-context";
import { applyColors, applyTheme, paletteOf } from "@/lib/theme";
import { Leaves } from "@/components/art";
import { AudioProvider } from "@/components/audio";
import { Closing } from "@/components/Closing";
import { Countdown } from "@/components/Countdown";
import { Day } from "@/components/Day";
import { Dock } from "@/components/Dock";
import { DressCode } from "@/components/DressCode";
import { Entrance } from "@/components/Entrance";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Program } from "@/components/Program";
import { Songs } from "@/components/Songs";
import { Meals } from "@/components/Meals";
import { Guestbook } from "@/components/Guestbook";
import { LanguageToggle, LocaleProvider } from "@/lib/locale";
import { EdgeMarquee } from "@/components/EdgeMarquee";
import { Story } from "@/components/Story";

export function WeddingSite() {
  const wedding = useWedding();
  const [entered, setEntered] = useState(!wedding.entrance.enabled);
  const [themeId, setThemeId] = useState(wedding.colorChoice);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("livre") === "1") setEntered(true);
  }, []);

  useEffect(() => {
    applyColors(paletteOf(wedding));
  }, [wedding]);

  useEffect(() => {
    if (!wedding.showThemePicker) return;
    const saved = sessionStorage.getItem("noces-theme");
    if (!saved) return;
    setThemeId(saved);
    applyTheme(saved);
  }, []);

  function chooseTheme(id: string) {
    setThemeId(id);
    applyTheme(id);
    sessionStorage.setItem("noces-theme", id);
  }

  return (
    <LocaleProvider>
    <div data-design={wedding.designId}>
    <AudioProvider>
      <LanguageToggle />
      <Leaves fixed />
      <EdgeMarquee />
      {entered ? null : (
        <Entrance onEnter={() => setEntered(true)} themeId={themeId} onTheme={chooseTheme} />
      )}
      <Hero />
      <main className="column">
        <Songs />
        <Countdown />
        <Story />
        <Day />
        <Program />
        <Meals />
        <DressCode />
        <Gallery />
        <Closing />
      </main>
      {entered ? <Dock /> : null}
      {entered ? <Guestbook /> : null}
    </AudioProvider>
    </div>
    </LocaleProvider>
  );
}
