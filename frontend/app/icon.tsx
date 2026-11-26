import { ImageResponse } from "next/og";
import { wedding } from "@/wedding.config";
import { colorsFor } from "@/lib/theme";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colorsFor().background,
          color: colorsFor().accent,
          fontSize: 22,
          letterSpacing: 1,
        }}
      >
        {wedding.couple.monogram.top}
        {wedding.couple.monogram.bottom}
      </div>
    ),
    size,
  );
}
