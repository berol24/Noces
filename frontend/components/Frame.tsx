"use client";

import { useState } from "react";
import { Flower } from "@/components/art";

export function Frame({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
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
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
