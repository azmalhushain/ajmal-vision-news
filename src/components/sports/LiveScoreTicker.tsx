import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatOvers } from "@/lib/sportsHelpers";

const db: any = supabase;

/**
 * Pinned live score ticker — fixed to bottom on mobile, top on desktop.
 * Auto-shows when there's a `live` match anywhere on the site, like Google's score card.
 */
export const LiveScoreTicker = () => {
  const [match, setMatch] = useState<any>(null);
  const [teams, setTeams] = useState<Record<string, any>>({});
  const [innings, setInnings] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  const load = async () => {
    const { data: m } = await db.from("matches").select("*")
      .eq("status", "live").order("scheduled_at", { ascending: false }).limit(1).maybeSingle();
    if (!m) { setMatch(null); return; }
    setMatch(m);
    const { data: t } = await db.from("teams").select("*").in("id", [m.team_a_id, m.team_b_id].filter(Boolean));
    const map: Record<string, any> = {};
    (t || []).forEach((x: any) => { map[x.id] = x; });
    setTeams(map);
    const { data: inn } = await db.from("match_innings").select("*").eq("match_id", m.id).order("innings_no");
    setInnings(inn || []);
  };

  useEffect(() => {
    load();
    const ch = db.channel("ticker-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_innings" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  // Hide on the match centre page itself & admin
  const onMatchPage = location.pathname.startsWith("/sports/match/");
  const onAdmin = location.pathname.startsWith("/admin");
  if (!match || dismissed || onMatchPage || onAdmin) return null;

  const a = teams[match.team_a_id]; const b = teams[match.team_b_id];
  const aInn = innings.find(i => i.batting_team_id === match.team_a_id);
  const bInn = innings.find(i => i.batting_team_id === match.team_b_id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-2xl"
      >
        <div className="relative rounded-2xl bg-gradient-to-r from-destructive via-destructive/90 to-destructive/80 text-destructive-foreground shadow-2xl border border-destructive/40 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--background)/0.18),transparent_60%)] pointer-events-none" />
          <Link to={`/sports/match/${match.id}`} className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 relative">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-background/80 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-background" />
              </span>
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">Live</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-3 sm:gap-5 min-w-0 overflow-hidden">
              {[{ t: a, inn: aInn }, { t: b, inn: bInn }].map(({ t, inn }, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-background/20 overflow-hidden flex items-center justify-center text-[10px] font-black border border-background/30 shrink-0">
                    {t?.logo_url ? <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" /> : (t?.short_name?.[0] || "?")}
                  </div>
                  <span className="font-bold text-xs sm:text-sm truncate">{t?.short_name || t?.name?.slice(0, 3) || "TBA"}</span>
                  {inn ? (
                    <motion.span
                      key={`${inn.runs}-${inn.wickets}`}
                      initial={{ scale: 1.3, color: "hsl(var(--background))" }}
                      animate={{ scale: 1, color: "currentColor" }}
                      transition={{ duration: 0.4 }}
                      className="font-black tabular-nums text-sm sm:text-base"
                    >
                      {inn.runs}/{inn.wickets}
                      <span className="opacity-70 text-[10px] sm:text-xs ml-0.5">({formatOvers(inn.overs)})</span>
                    </motion.span>
                  ) : (
                    <span className="text-[10px] opacity-70">yet to bat</span>
                  )}
                </div>
              ))}
            </div>
            {match.youtube_url && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold bg-background/20 rounded-full px-2 py-1 shrink-0">
                <Play className="h-3 w-3 fill-current" /> Watch
              </span>
            )}
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
            aria-label="Dismiss live score"
            className="absolute top-1 right-1 p-1 rounded-full hover:bg-background/20 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
