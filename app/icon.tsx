import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: "#0D0F12",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E2FF54",
          border: "2px solid #E2FF54",
          borderRadius: "6px",
          fontWeight: 900,
        }}
      >
        ⚡
      </div>
    ),
    {
      ...size,
    }
  );
}
