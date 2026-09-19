import { ImageResponse } from "next/og";

export const alt = "product x — interactive e-learning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #c026d3 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            x
          </div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>product x</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Interactive learning. Every lesson counts.
          </div>
          <div style={{ fontSize: 34, opacity: 0.85 }}>Courses, tracks, quizzes and certificates — free to start.</div>
        </div>
      </div>
    ),
    size
  );
}
