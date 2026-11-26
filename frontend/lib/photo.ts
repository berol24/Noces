import type { CSSProperties } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function percent(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const number = Number(value.replace("%", ""));
  return Number.isFinite(number) ? clamp(number, 0, 100) : fallback;
}

export function readFocus(focus?: string) {
  const parts = (focus || "").trim().split(/\s+/);
  const zoom = Number(parts[2]);
  return {
    x: percent(parts[0], 50),
    y: percent(parts[1], 32),
    zoom: clamp(Number.isFinite(zoom) && zoom > 0 ? zoom : 1, 1, 3),
  };
}

export function writeFocus(x: number, y: number, zoom: number) {
  const nextZoom = Math.round(clamp(zoom, 1, 3) * 100) / 100;
  const base = `${Math.round(clamp(x, 0, 100))}% ${Math.round(clamp(y, 0, 100))}%`;
  return nextZoom <= 1 ? base : `${base} ${nextZoom}`;
}

export function focusStyle(focus?: string): CSSProperties {
  const { x, y, zoom } = readFocus(focus);
  return {
    objectPosition: `${x}% ${y}%`,
    transformOrigin: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    ["--zoom" as string]: String(zoom),
  };
}
