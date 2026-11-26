import { ImageResponse } from "next/og";
import { wedding } from "@/wedding.config";
import { coupleLine, fullDate } from "@/lib/text";
import { colorsFor } from "@/lib/theme";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${coupleLine()} — ${fullDate()}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: colorsFor().background,
          color: colorsFor().text,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: colorsFor().accent }}>
          SAVE THE DATE
        </div>
        <div style={{ display: "flex", fontSize: 84, marginTop: 18 }}>{coupleLine()}</div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 16, color: colorsFor().accent }}>
          {fullDate()} · {wedding.date.city}
        </div>
      </div>
    ),
    size,
  );
}
