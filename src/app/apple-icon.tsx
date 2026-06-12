import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 9999,
            background: "linear-gradient(135deg, #FF9500 0%, #FFD60A 50%, #FF6B00 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000000",
            fontSize: 68,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          F
        </div>
      </div>
    ),
    { ...size }
  );
}
