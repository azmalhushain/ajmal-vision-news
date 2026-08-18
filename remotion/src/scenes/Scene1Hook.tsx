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

const WORD = "AJMAL AKHTAR AZAD".split("");

export const Scene1Hook: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgScale = interpolate(frame, [0, 120], [1.18, 1.02]);
  const imgOpacity = interpolate(frame, [0, 25], [0, 0.42], { extrapolateRight: "clamp" });
  const kickerY = interpolate(
    spring({ frame: frame - 6, fps, config: { damping: 200 } }),
    [0, 1],
    [40, 0]
  );
  const lineW = interpolate(frame, [30, 70], [0, 520], { extrapolateRight: "clamp" });
  const subOpacity = interpolate(frame, [48, 72], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <AbsoluteFill style={{ opacity: imgOpacity }}>
        <Img
          src={staticFile("images/og-home.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${imgScale})`,
            filter: "grayscale(0.35) contrast(1.1)",
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(90deg, rgba(7,8,11,0.98) 25%, rgba(7,8,11,0.35) 75%)",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          paddingLeft: 150,
          paddingRight: 400,
        }}
      >
        <div
          style={{
            transform: `translateY(${kickerY}px)`,
            color: COLORS.accentSoft,
            letterSpacing: 10,
            fontSize: 24,
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 26,
          }}
        >
          Bhokraha Narsingh Municipality · Sunsari, Nepal
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 1150 }}>
          {WORD.map((c, i) => {
            const s = spring({
              frame: frame - 10 - i * 2,
              fps,
              config: { damping: 18, stiffness: 140 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: 118,
                  lineHeight: 1.02,
                  fontWeight: 900,
                  color: COLORS.ink,
                  opacity: s,
                  transform: `translateY(${(1 - s) * 70}px) rotateX(${(1 - s) * 60}deg)`,
                  filter: `blur(${(1 - s) * 8}px)`,
                  marginRight: c === " " ? 30 : 0,
                }}
              >
                {c === " " ? "" : c}
              </span>
            );
          })}
        </div>

        <div
          style={{
            height: 4,
            width: lineW,
            marginTop: 34,
            background: `linear-gradient(90deg, ${COLORS.accent}, rgba(10,132,255,0))`,
          }}
        />

        <div
          style={{
            marginTop: 30,
            fontSize: 34,
            color: COLORS.muted,
            opacity: subOpacity,
            maxWidth: 900,
          }}
        >
          The official digital home of the Mayor — and of the people he serves.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
