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

export const Scene4Sports: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const runs = Math.round(interpolate(frame, [18, 70], [0, 164], { extrapolateRight: "clamp" }));
  const overs = interpolate(frame, [18, 70], [0, 17.4], { extrapolateRight: "clamp" });
  const panelIn = spring({ frame: frame - 6, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <AbsoluteFill>
        <Img
          src={staticFile("images/sports-stadium-hero.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${interpolate(frame, [0, 120], [1.05, 1.16])})`,
            filter: "saturate(1.1) contrast(1.05)",
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(75deg, rgba(7,8,11,0.97) 30%, rgba(7,8,11,0.45) 100%)",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: "0 150px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 99,
              background: "#FF3B30",
              opacity: interpolate(Math.sin(frame / 5), [-1, 1], [0.35, 1]),
            }}
          />
          <div
            style={{
              color: "#FF6B60",
              fontWeight: 800,
              letterSpacing: 8,
              fontSize: 22,
            }}
          >
            LIVE SPORTS PORTAL
          </div>
        </div>

        <div style={{ fontSize: 104, fontWeight: 900, color: COLORS.ink, lineHeight: 1.05 }}>
          KPL3 <span style={{ color: COLORS.gold }}>Tournament</span>
        </div>
        <div style={{ fontSize: 28, color: COLORS.muted, marginTop: 16, maxWidth: 780 }}>
          Ball-by-ball scoring, squads, points table and highlights — updated in real time.
        </div>

        <div
          style={{
            marginTop: 46,
            display: "flex",
            gap: 24,
            opacity: panelIn,
            transform: `translateY(${(1 - panelIn) * 60}px)`,
          }}
        >
          <div
            style={{
              padding: "30px 44px",
              borderRadius: 26,
              background: "rgba(10,18,32,0.72)",
              border: "1px solid rgba(255,255,255,0.14)",
              minWidth: 430,
            }}
          >
            <div style={{ fontSize: 20, letterSpacing: 4, color: COLORS.muted }}>
              BHOKRAHA XI
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
              <div style={{ fontSize: 78, fontWeight: 900, color: COLORS.ink }}>{runs}/4</div>
              <div style={{ fontSize: 30, color: COLORS.accentSoft }}>
                ({overs.toFixed(1)} ov)
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "30px 44px",
              borderRadius: 26,
              background: "rgba(10,132,255,0.16)",
              border: "1px solid rgba(10,132,255,0.5)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 20, letterSpacing: 4, color: COLORS.accentSoft }}>
              REQUIRED
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.ink, marginTop: 6 }}>
              38 off 26
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
