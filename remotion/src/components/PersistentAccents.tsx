import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, SITE } from "../theme";

const DOTS = new Array(18).fill(0).map((_, i) => ({
  x: (i * 137) % 100,
  y: (i * 61) % 100,
  s: 2 + (i % 3),
  sp: 18 + (i % 5) * 7,
}));

export const PersistentAccents: React.FC = () => {
  const frame = useCurrentFrame();
  const barIn = interpolate(frame, [8, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {DOTS.map((d, i) => {
        const y = (d.y - ((frame / d.sp) % 120) + 120) % 120;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${y - 10}%`,
              width: d.s,
              height: d.s,
              borderRadius: 99,
              background: i % 4 === 0 ? COLORS.accentSoft : "rgba(255,255,255,0.5)",
              opacity: 0.5,
            }}
          />
        );
      })}

      {/* corner frame lines */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 64,
          bottom: 64,
          width: 2,
          transformOrigin: "top",
          transform: `scaleY(${barIn})`,
          background:
            "linear-gradient(180deg, rgba(10,132,255,0.9), rgba(255,255,255,0.05))",
        }}
      />

      {/* persistent site tag */}
      <div
        style={{
          position: "absolute",
          right: 74,
          bottom: 62,
          fontSize: 22,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLORS.muted,
          opacity: interpolate(frame, [20, 55], [0, 0.85], { extrapolateRight: "clamp" }),
        }}
      >
        {SITE}
      </div>
    </AbsoluteFill>
  );
};
