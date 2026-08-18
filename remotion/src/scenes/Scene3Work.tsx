import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

const CARDS = [
  { img: "images/news-infrastructure.jpg", t: "Infrastructure", d: "Roads, water, power" },
  { img: "images/news-education.jpg", t: "Education", d: "Schools & scholarships" },
  { img: "images/news-healthcare.jpg", t: "Healthcare", d: "Clinics for every ward" },
  { img: "images/og-gallery.jpg", t: "Community", d: "Gallery & events" },
];

export const Scene3Work: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily, padding: "110px 150px", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginBottom: 44 }}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: COLORS.ink,
            transform: `translateX(${interpolate(
              spring({ frame, fps, config: { damping: 200 } }),
              [0, 1],
              [-80, 0]
            )}px)`,
            opacity: interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Work you can <span style={{ color: COLORS.accent }}>see</span>.
        </div>
        <div
          style={{
            fontSize: 24,
            color: COLORS.muted,
            paddingBottom: 18,
            opacity: interpolate(frame, [14, 34], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          News · Vision · Podcasts · Gallery
        </div>
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {CARDS.map((c, i) => {
          const s = spring({
            frame: frame - 10 - i * 7,
            fps,
            config: { damping: 20, stiffness: 130 },
          });
          const park = Math.sin((frame + i * 30) / 50) * 8;
          const tall = i % 2 === 0;
          return (
            <div
              key={c.t}
              style={{
                flex: 1,
                height: tall ? 560 : 500,
                marginTop: tall ? 0 : 40,
                borderRadius: 28,
                overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.12)",
                opacity: s,
                transform: `translateY(${(1 - s) * 90 + park}px) scale(${0.94 + s * 0.06})`,
                boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
              }}
            >
              <Img
                src={staticFile(c.img)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${1.12 + interpolate(frame, [0, 120], [0, 0.08])})`,
                }}
              />
              <AbsoluteFill
                style={{
                  background:
                    "linear-gradient(180deg, rgba(7,8,11,0) 35%, rgba(7,8,11,0.92) 100%)",
                }}
              />
              <div style={{ position: "absolute", left: 30, right: 24, bottom: 28 }}>
                <div style={{ fontSize: 38, fontWeight: 800, color: COLORS.ink }}>{c.t}</div>
                <div style={{ fontSize: 21, color: COLORS.muted, marginTop: 4 }}>{c.d}</div>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: 30,
                  padding: "8px 16px",
                  borderRadius: 99,
                  fontSize: 16,
                  letterSpacing: 3,
                  color: COLORS.ink,
                  background: "rgba(10,132,255,0.85)",
                  fontWeight: 700,
                }}
              >
                0{i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
