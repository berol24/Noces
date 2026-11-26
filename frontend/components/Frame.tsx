"use client";

import { useState } from "react";
import { Flower } from "@/components/art";
import { focusStyle } from "@/lib/photo";

export function Frame({
  src,
  alt,
  className = "",
  focus = "50% 32%",
}: {
  src: string;
  alt: string;
  className?: string;
  focus?: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (!src || failed) {
    return (
      <div className={`frame-fallback ${className}`.trim()}>
        <Flower />
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <span className={`crop ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        style={focusStyle(focus)}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
