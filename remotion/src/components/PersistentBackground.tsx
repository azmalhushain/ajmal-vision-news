import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;
  const drift2 = Math.cos(frame / 70) * 80;
  const pulse = interpolate(Math.sin(frame / 45), [-1, 1], [0.28, 0.5]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 700px at ${20 + drift / 8}% ${
            15 + drift2 / 20
          }%, rgba(10,132,255,${pulse}) 0%, rgba(7,8,11,0) 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${85 - drift / 10}% ${
            85 - drift2 / 25
          }%, rgba(11,18,32,0.95) 0%, rgba(7,8,11,0) 65%)`,
        }}
      />
      {/* fine grid */}
      <AbsoluteFill
        style={{
          opacity: 0.09,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          transform: `translateY(${(frame % 88) * -1}px)`,
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
