import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Radio, Play } from "lucide-react";
import { formatOvers } from "@/lib/sportsHelpers";

const db: any = supabase;

export const LiveMatchBanner = () => {
  const [match, setMatch] = useState<any>(null);
  const [teams, setTeams] = useState<Record<string, any>>({});
  const [innings, setInnings] = useState<any[]>([]);

  const load = async () => {
    const { data: m } = await db.from("matches").select("*").eq("status", "live").order("scheduled_at", { ascending: false }).limit(1).maybeSingle();
    if (!m) { setMatch(null); return; }
    setMatch(m);
    const { data: t } = await db.from("teams").select("*").in("id", [m.team_a_id, m.team_b_id]);
    const map: Record<string, any> = {};
    (t || []).forEach((x: any) => { map[x.id] = x; });
    setTeams(map);
    const { data: inn } = await db.from("match_innings").select("*").eq("match_id", m.id).order("innings_no");
    setInnings(inn || []);
  };

  useEffect(() => {
    load();
    const ch = db.channel("live-banner")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_innings" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  if (!match) return null;
  const a = teams[match.team_a_id]; const b = teams[match.team_b_id];
  const aInn = innings.find(i => i.batting_team_id === match.team_a_id);
  const bInn = innings.find(i => i.batting_team_id === match.team_b_id);

  return (
    <Link
      to={`/sports/match/${match.id}`}
      className="block bg-gradient-to-r from-destructive/90 via-destructive to-destructive/80 text-destructive-foreground rounded-2xl p-4 sm:p-5 shadow-2xl border border-destructive/40 backdrop-blur-xl group"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Radio className="h-4 w-4 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase">Live · KPL3</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 flex-wrap min-w-0">
          {[{ t: a, inn: aInn }, { t: b, inn: bInn }].map(({ t, inn }, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-background/20 overflow-hidden flex items-center justify-center text-xs font-bold border border-background/30">
                {t?.logo_url ? <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" /> : t?.short_name?.[0] || "?"}
              </div>
              <span className="font-semibold text-sm sm:text-base">{t?.short_name || t?.name?.slice(0, 3) || "TBA"}</span>
              {inn && <span className="font-bold tabular-nums text-sm sm:text-base">{inn.runs}/{inn.wickets} <span className="opacity-70 text-xs">({formatOvers(inn.overs)})</span></span>}
            </div>
          ))}
        </div>
        {match.youtube_url && (
          <span className="flex items-center gap-1 text-xs font-semibold bg-background/20 rounded-full px-3 py-1 group-hover:bg-background/30">
            <Play className="h-3 w-3" /> Watch
          </span>
        )}
      </div>
      {match.commentary_note && (
        <p className="mt-2 text-xs sm:text-sm opacity-90 truncate">{match.commentary_note}</p>
      )}
    </Link>
  );
};
