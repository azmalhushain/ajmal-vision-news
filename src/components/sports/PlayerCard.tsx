import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Globe2 } from "lucide-react";

export interface PlayerCardData {
  id: string;
  slug?: string | null;
  name: string;
  photo_url?: string | null;
  role?: string | null;
  jersey_number?: number | null;
  is_captain?: boolean;
  is_overseas?: boolean;
  batting_style?: string | null;
  bowling_style?: string | null;
  stats?: Record<string, any> | null;
}

interface PlayerCardProps {
  player: PlayerCardData;
  /** Optional team accent color (hex). Falls back to sports blue accent. */
  accent?: string;
  /** index for stagger animation */
  index?: number;
  /** When false, renders without a Link wrapper */
  linkable?: boolean;
}

const num = (v: any) => (v === null || v === undefined || v === "" ? null : Number(v));

const StatCell = ({ label, value }: { label: string; value: any }) => (
  <div className="text-center">
    <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">{label}</div>
    <div className="text-sm font-bold text-white mt-0.5 tabular-nums">{value ?? "—"}</div>
  </div>
);

export const PlayerCard = ({ player: p, accent, index = 0, linkable = true }: PlayerCardProps) => {
  const s = (p.stats ?? {}) as Record<string, any>;
  const role = (p.role || "").toLowerCase();
  const isBowler = role.includes("bowl");
  const isKeeper = role.includes("keep") || role.includes("wk");

  // Choose 3 stat cells appropriate to the role
  const stats: Array<{ label: string; value: any }> = isBowler
    ? [
        { label: "Mat", value: num(s.matches) },
        { label: "Wkts", value: num(s.wickets) },
        { label: "Eco", value: num(s.economy) },
      ]
    : isKeeper
      ? [
          { label: "Mat", value: num(s.matches) },
          { label: "Catches", value: num(s.catches) },
          { label: "Stump", value: num(s.stumpings) },
        ]
      : [
          { label: "Mat", value: num(s.matches) },
          { label: "Runs", value: num(s.runs) },
          { label: "SR", value: num(s.sr) ?? num(s.strike_rate) },
        ];

  const accentHex = accent || "hsl(210 100% 56%)";
  const glowStyle = { background: `radial-gradient(closest-side, ${accentHex}40, transparent 70%)` };
  const ringStyle = { boxShadow: `0 0 0 2px ${accentHex}30, 0 0 40px -8px ${accentHex}55` };

  const body = (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative flex flex-col aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/30 hover:shadow-[0_20px_60px_-15px_rgba(30,144,255,0.45)] active:scale-[0.98]"
    >
      {/* Top accent line on hover */}
      <div
        className="h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)` }}
      />

      {/* Jersey number watermark */}
      <div className="absolute top-3 right-4 text-6xl sm:text-7xl font-black text-white/[0.04] select-none pointer-events-none group-hover:text-white/[0.08] transition-colors leading-none tabular-nums">
        {p.jersey_number != null ? String(p.jersey_number).padStart(2, "0") : ""}
      </div>

      {/* Photo zone */}
      <div className="relative flex-1 flex items-end justify-center pt-7">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" style={glowStyle} />

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {p.is_captain && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <Crown className="w-3 h-3 fill-current" /> Captain
            </span>
          )}
          {p.is_overseas && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-[10px] font-bold uppercase tracking-wider text-white/70">
              <Globe2 className="w-3 h-3" /> Overseas
            </span>
          )}
        </div>

        {/* Avatar */}
        <div
          className="relative z-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-white/15 flex items-center justify-center overflow-hidden text-3xl font-black text-white/90 shadow-2xl transition-transform duration-500 group-hover:scale-105"
          style={ringStyle}
        >
          {p.photo_url ? (
            <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span>{(p.name || "?").trim().charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="relative px-4 sm:px-5 pt-3 pb-4 space-y-3">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">{p.name}</h3>
          {p.role && (
            <span
              className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border"
              style={{ background: `${accentHex}15`, color: accentHex, borderColor: `${accentHex}35` }}
            >
              {p.role}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 py-2.5 border-y border-white/5">
          <StatCell label={stats[0].label} value={stats[0].value} />
          <div className="border-x border-white/5">
            <StatCell label={stats[1].label} value={stats[1].value} />
          </div>
          <StatCell label={stats[2].label} value={stats[2].value} />
        </div>

        <div className="flex justify-between items-center text-[9px] sm:text-[10px] uppercase font-bold text-white/40 tracking-widest">
          <span className="truncate">{p.batting_style || "—"}</span>
          <span className="truncate text-right">{p.bowling_style || (isKeeper ? "Wicket-keeper" : "—")}</span>
        </div>
      </div>
    </motion.div>
  );

  if (linkable && p.slug) {
    return (
      <Link to={`/sports/player/${p.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sports-accent,210_100%_56%))] rounded-2xl">
        {body}
      </Link>
    );
  }
  return body;
};

export default PlayerCard;
