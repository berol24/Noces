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
          background: "#0f1a33",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 30,
            border: "2px solid #a0a0d0",
            marginRight: -12,
          }}
        />
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 30,
            border: "2px solid #8080c0",
          }}
        />
      </div>
    ),
    size,
  );
}
