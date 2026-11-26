import { ImageResponse } from "next/og";

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
          background: "#f6f1e6",
          color: "#1b2a4a",
          fontSize: 40,
          fontFamily: "Georgia",
        }}
      >
        <div style={{ display: "flex", marginTop: 8 }}>N</div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 8,
            right: 8,
            width: 16,
            height: 16,
            borderRadius: 16,
            border: "1.5px solid #a9b4ee",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 6,
            right: 18,
            width: 16,
            height: 16,
            borderRadius: 16,
            border: "1.5px solid #8e97d8",
          }}
        />
      </div>
    ),
    size,
  );
}
