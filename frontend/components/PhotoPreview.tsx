"use client";

import { useRef } from "react";
import { focusStyle, readFocus, writeFocus } from "@/lib/photo";

export function PhotoPreview({
  src,
  focus = "50% 32%",
  shape = "portrait",
  onFocus,
  onRemove,
}: {
  src: string;
  focus?: string;
  shape?: "arch" | "portrait" | "wide";
  onFocus: (focus: string) => void;
  onRemove?: () => void;
}) {
  const drag = useRef<{ px: number; py: number; x: number; y: number; zoom: number } | null>(null);
  const place = readFocus(focus);

  return (
    <div className="shot">
      <div
        className={`shot-frame shot-${shape}`}
        onPointerDown={(event) => {
          drag.current = { px: event.clientX, py: event.clientY, x: place.x, y: place.y, zoom: place.zoom };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || event.buttons !== 1) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const dx = ((event.clientX - start.px) / rect.width) * 100;
          const dy = ((event.clientY - start.py) / rect.height) * 100;
          onFocus(writeFocus(start.x - dx, start.y - dy, start.zoom));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <img src={src} alt="" style={focusStyle(focus)} />
      </div>
      <label className="shot-zoom">Zoom
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={place.zoom}
          aria-valuetext={`${Math.round(place.zoom * 100)} %`}
          onChange={(event) => onFocus(writeFocus(place.x, place.y, Number(event.target.value)))}
        />
        <span>{Math.round(place.zoom * 100)}%</span>
      </label>
      <p className="note">Glissez la photo vers la gauche, la droite, le haut ou le bas. Le curseur zoome.</p>
      {onRemove ? (
        <button className="text-link" type="button" onClick={onRemove}>Supprimer</button>
      ) : null}
    </div>
  );
}
