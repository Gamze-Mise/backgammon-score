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
          background: "#c2410c",
          borderRadius: "36px",
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 24 24"
          fill="none"
          style={{ margin: "auto" }}
        >
          <rect
            x="1"
            y="1"
            width="22"
            height="22"
            rx="4"
            fill="#ea580c"
            stroke="#fff"
            strokeWidth="1.5"
          />
          <circle cx="6" cy="6" r="2" fill="#fff" />
          <circle cx="18" cy="18" r="2" fill="#fff" />
          <circle cx="12" cy="12" r="2" fill="#fff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
