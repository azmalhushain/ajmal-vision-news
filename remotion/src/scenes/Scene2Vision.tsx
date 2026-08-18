import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { COLORS } from "../theme";

const WORDS = ["DEVELOPMENT.", "DIGNITY.", "DEMOCRACY."];
const STATS = [
  { n: "15+", l: "Projects delivered" },
  { n: "500+", l: "Families benefited" },
  { n: "24/7", l: "Open to citizens" },
];

export const Scene2Vision: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily, justifyContent: "center", paddingLeft: 150 }}>
      <div
        style={{
          color: COLORS.accentSoft,
          letterSpacing: 10,
          fontSize: 22,
          fontWeight: 600,
          opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        THE VISION
      </div>

      <div style={{ marginTop: 26 }}>
        {WORDS.map((w, i) => {
          const s = spring({
            frame: frame - 8 - i * 12,
            fps,
            config: { damping: 200 },
          });
          const float = Math.sin((frame - i * 20) / 40) * 5;
          return (
            <div key={w} style={{ overflow: "hidden", height: 132 }}>
              <div
                style={{
                  fontSize: 112,
                  fontWeight: 900,
                  lineHeight: 1.14,
                  letterSpacing: -2,
                  color: i === 1 ? COLORS.accent : COLORS.ink,
                  transform: `translateY(${(1 - s) * 130 + float}px)`,
                }}
              >
                {w}
              </div>
            </div>
          );
        })}
      </div>

      <Sequence from={46}>
        <StatRow fontFamily={fontFamily} />
      </Sequence>
    </AbsoluteFill>
  );
};

const StatRow: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        bottom: 130,
        display: "flex",
        gap: 34,
        fontFamily,
      }}
    >
      {STATS.map((s, i) => {
        const sp = spring({ frame: frame - i * 8, fps, config: { damping: 16, stiffness: 160 } });
        return (
          <div
            key={s.l}
            style={{
              opacity: sp,
              transform: `translateY(${(1 - sp) * 50}px)`,
              padding: "26px 40px",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.045)",
              minWidth: 300,
            }}
          >
            <div style={{ fontSize: 62, fontWeight: 900, color: COLORS.ink }}>{s.n}</div>
            <div
              style={{
                fontSize: 20,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: COLORS.muted,
                marginTop: 6,
              }}
            >
              {s.l}
            </div>
          </div>
        );
      })}
    </div>
  );
};
