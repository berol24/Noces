import type { CSSProperties } from "react";
import { wedding, type WeddingColors } from "@/wedding.config";

export function themeStyle(colors: WeddingColors): CSSProperties {
  return {
    "--bg": colors.background,
    "--ink": colors.text,
    "--muted": colors.muted,
    "--accent": colors.accent,
    "--accent-deep": colors.accentDeep,
    "--leaf": colors.leaf,
    "--flower": colors.flower,
  } as CSSProperties;
}

export function colorsFor(choice = wedding.colorChoice): WeddingColors {
  if (choice === "personnalise") return wedding.colors;
  return wedding.themes.find((theme) => theme.id === choice)?.colors ?? wedding.colors;
}

export function paletteOf(data: { colorChoice: string; colors: WeddingColors; themes: { id: string; colors: WeddingColors }[] }): WeddingColors {
  if (data.colorChoice === "personnalise") return data.colors;
  return data.themes.find((theme) => theme.id === data.colorChoice)?.colors ?? data.colors;
}

export function applyColors(colors: WeddingColors) {
  if (typeof document === "undefined") return;
  const style = themeStyle(colors);
  for (const [key, value] of Object.entries(style)) {
    document.documentElement.style.setProperty(key, String(value));
  }
}

export function applyTheme(choice: string) {
  applyColors(colorsFor(choice));
}

function channel(hex: string) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((item) => item + item).join("") : value;
  return [0, 2, 4].map((index) => Number.parseInt(full.slice(index, index + 2), 16));
}

export function mixHex(from: string, to: string, amount: number) {
  const start = channel(from);
  const end = channel(to);
  const mixed = start.map((item, index) => Math.round(item + (end[index] - item) * amount));
  return `#${mixed.map((item) => item.toString(16).padStart(2, "0")).join("")}`;
}

export function customPalette(background: string, text: string, accent: string): WeddingColors {
  return {
    background,
    text,
    accent,
    muted: mixHex(text, background, 0.45),
    accentDeep: mixHex(accent, background, 0.35),
    leaf: mixHex(background, "#14362c", 0.55),
    flower: mixHex(accent, text, 0.25),
  };
}
