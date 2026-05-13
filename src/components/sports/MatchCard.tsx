import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Radio } from "lucide-react";
import { formatOvers } from "@/lib/sportsHelpers";

type Team = { id: string; name: string; short_name?: string | null; logo_url?: string | null; color_primary?: string | null };
type Innings = { batting_team_id: string; runs: number; wickets: number; overs: number };

export const MatchCard = ({
  match, teamA, teamB, innings = [],
}: {
  match: any; teamA?: Team; teamB?: Team; innings?: Innings[];
}) => {
  const aInn = innings.find(i => i.batting_team_id === teamA?.id);
  const bInn = innings.find(i => i.batting_team_id === teamB?.id);
  const isLive = match.status === "live";
  const isDone = match.status === "completed";

  return (
    <Link
      to={`/sports/match/${match.id}`}
      className="block glass-card glass-hover rounded-2xl p-4 sm:p-5 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">M{match.match_no || "-"}</Badge>
        {isLive ? (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <Radio className="h-3 w-3 animate-pulse" /> LIVE
          </Badge>
        ) : (
          <Badge variant="secondary" className="capitalize text-[10px]">{match.status}</Badge>
        )}
      </div>

      <div className="space-y-3">
        {[{ t: teamA, inn: aInn }, { t: teamB, inn: bInn }].map(({ t, inn }, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden border-2 border-background"
              style={{ background: t?.color_primary || "#444" }}
            >
              {t?.logo_url ? (
                <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                t?.short_name || t?.name?.[0] || "?"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">{t?.name || "TBA"}</p>
            </div>
            {inn && (isLive || isDone) && (
              <div className="text-right">
                <span className="font-bold text-base sm:text-lg tabular-nums">{inn.runs}/{inn.wickets}</span>
                <span className="text-xs text-muted-foreground ml-1">({formatOvers(inn.overs)})</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {match.result_text && isDone && (
        <p className="mt-3 pt-3 border-t border-border/50 text-xs text-accent font-semibold">{match.result_text}</p>
      )}
      {!isDone && match.scheduled_at && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(match.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
          {match.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.venue}</span>}
        </div>
      )}
    </Link>
  );
};
