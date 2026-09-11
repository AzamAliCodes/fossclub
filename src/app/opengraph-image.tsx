import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FOSS Club SRM — SRMIST Kattankulathur";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#050507",
          padding: "70px 80px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow ambient circles */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Top bar: Badge & Chapter info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
              }}
            />
            <span
              style={{
                color: "#22c55e",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Official FOSS United Student Chapter
            </span>
          </div>

          <span
            style={{
              color: "#a1a1aa",
              fontSize: "18px",
              fontWeight: 500,
              fontFamily: "monospace",
            }}
          >
            SRMIST · Kattankulathur
          </span>
        </div>

        {/* Center: Main Title and Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                fontSize: "76px",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#fafafa",
                lineHeight: 1.1,
              }}
            >
              FOSS Club SRM
            </div>
          </div>

          <p
            style={{
              fontSize: "26px",
              color: "#d4d4d8",
              lineHeight: 1.4,
              maxWidth: "960px",
              margin: 0,
            }}
          >
            Empowering developers through open source software, national hackathons,
            Linux workshops, and collaborative community building.
          </p>
        </div>

        {/* Bottom bar: Tech badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "14px",
            }}
          >
            {["Open Source", "Hackathons", "Linux & Systems", "Workshops", "Community"].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  color: "#e4e4e7",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <span
            style={{
              color: "#22c55e",
              fontSize: "20px",
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            fossunited.org/c/srm-ktr
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
