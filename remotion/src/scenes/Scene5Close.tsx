import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SITE } from "../theme";

const FEATURES = ["News", "Vision", "Sports", "Podcasts", "Gallery", "Contact"];

export const Scene5Close: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = spring({ frame, fps, config: { damping: 200 } });
  const domain = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 120 } });
  const sweep = interpolate(frame, [30, 95], [-30, 130]);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: 999,
          border: "1px solid rgba(10,132,255,0.35)",
          transform: `scale(${0.6 + ring * 0.5})`,
          opacity: 0.5 * ring,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.12)",
          transform: `scale(${0.8 + ring * 0.35}) rotate(${frame}deg)`,
        }}
      />

      <div
        style={{
          fontSize: 30,
          letterSpacing: 12,
          color: COLORS.accentSoft,
          fontWeight: 600,
          opacity: ring,
        }}
      >
        TOGETHER FOR A PROSPEROUS
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: COLORS.ink,
          marginTop: 14,
          transform: `translateY(${(1 - ring) * 40}px)`,
        }}
      >
        BHOKRAHA NARSINGH
      </div>

      <div
        style={{
          marginTop: 44,
          position: "relative",
          overflow: "hidden",
          padding: "22px 58px",
          borderRadius: 999,
          border: "1px solid rgba(10,132,255,0.6)",
          background: "rgba(10,132,255,0.14)",
          transform: `scale(${0.85 + domain * 0.15})`,
          opacity: domain,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.ink, letterSpacing: 2 }}>
          {SITE}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sweep}%`,
            width: 140,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-18deg)",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
        {FEATURES.map((f, i) => {
          const s = spring({ frame: frame - 40 - i * 5, fps, config: { damping: 18 } });
          return (
            <div
              key={f}
              style={{
                padding: "12px 26px",
                borderRadius: 99,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.05)",
                color: COLORS.muted,
                fontSize: 22,
                opacity: s,
                transform: `translateY(${(1 - s) * 24}px)`,
              }}
            >
              {f}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
