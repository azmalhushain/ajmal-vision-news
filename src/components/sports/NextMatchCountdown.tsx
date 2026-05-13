import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

const db: any = supabase;

const tick = (target: Date) => {
  const diff = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff <= 0 };
};

export const NextMatchCountdown = () => {
  const [match, setMatch] = useState<any>(null);
  const [teams, setTeams] = useState<Record<string, any>>({});
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, done: false });

  useEffect(() => {
    (async () => {
      const { data: m } = await db.from("matches").select("*")
        .eq("status", "scheduled").gt("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true }).limit(1).maybeSingle();
      if (!m) return;
      setMatch(m);
      const { data: t } = await db.from("teams").select("*").in("id", [m.team_a_id, m.team_b_id]);
      const map: Record<string, any> = {};
      (t || []).forEach((x: any) => { map[x.id] = x; });
      setTeams(map);
    })();
  }, []);

  useEffect(() => {
    if (!match?.scheduled_at) return;
    const target = new Date(match.scheduled_at);
    setTime(tick(target));
    const id = setInterval(() => setTime(tick(target)), 1000);
    return () => clearInterval(id);
  }, [match]);

  if (!match || time.done) return null;
  const a = teams[match.team_a_id]; const b = teams[match.team_b_id];

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="flex flex-col items-center min-w-[48px]">
      <span className="text-2xl sm:text-3xl font-black tabular-nums text-foreground">{String(v).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</span>
    </div>
  );

  return (
    <Link to={`/sports/match/${match.id}`} className="glass-card glass-hover block rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-1.5"><Clock className="h-3 w-3" /> Next match</p>
          <p className="text-base sm:text-lg font-bold mt-1 truncate">
            {a?.short_name || a?.name || "TBA"} <span className="text-muted-foreground mx-1.5">vs</span> {b?.short_name || b?.name || "TBA"}
          </p>
          {match.venue && <p className="text-xs text-muted-foreground truncate">{match.venue}</p>}
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Cell v={time.d} l="Days" />
          <Cell v={time.h} l="Hrs" />
          <Cell v={time.m} l="Min" />
          <Cell v={time.s} l="Sec" />
        </div>
      </div>
    </Link>
  );
};
