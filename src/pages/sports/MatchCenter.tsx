import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Radio, MapPin, Calendar, Play } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { formatOvers, youtubeEmbed } from "@/lib/sportsHelpers";

const db: any = supabase;

const MatchCenter = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [teams, setTeams] = useState<Record<string, any>>({});
  const [innings, setInnings] = useState<any[]>([]);

  const load = async () => {
    if (!id) return;
    const { data: m } = await db.from("matches").select("*").eq("id", id).maybeSingle();
    if (!m) return;
    setMatch(m);
    const { data: t } = await db.from("teams").select("*").in("id", [m.team_a_id, m.team_b_id]);
    const map: Record<string, any> = {};
    (t || []).forEach((x: any) => { map[x.id] = x; });
    setTeams(map);
    const { data: inn } = await db.from("match_innings").select("*").eq("match_id", id).order("innings_no");
    setInnings(inn || []);
  };

  useEffect(() => {
    load();
    if (!id) return;
    const ch = db.channel(`match-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `id=eq.${id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_innings", filter: `match_id=eq.${id}` }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, [id]);

  if (!match) return <div className="min-h-screen pt-24 text-center text-muted-foreground">Loading match…</div>;

  const a = teams[match.team_a_id]; const b = teams[match.team_b_id];
  const aInn = innings.find(i => i.batting_team_id === match.team_a_id);
  const bInn = innings.find(i => i.batting_team_id === match.team_b_id);
  const isLive = match.status === "live";
  const embed = youtubeEmbed(match.youtube_url);
  const title = `${a?.name || "TBA"} vs ${b?.name || "TBA"} — KPL3 Match Centre`;

  return (
    <PageTransition>
      <SEOHead
        title={title}
        description={match.result_text || `Live scorecard, commentary and stream for ${a?.name} vs ${b?.name} in KPL3.`}
        url={`/sports/match/${match.id}`}
        image={match.poster_url}
      />
      <div className="min-h-screen pt-20 sm:pt-24">
        <div className="container mx-auto px-4 py-4">
          <Link to="/sports" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to portal
          </Link>

          <div className="glass-card rounded-3xl p-5 sm:p-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <Badge variant="outline">Match {match.match_no || "-"}</Badge>
              {isLive ? (
                <Badge variant="destructive" className="gap-1"><Radio className="h-3 w-3 animate-pulse" /> LIVE</Badge>
              ) : (
                <Badge variant="secondary" className="capitalize">{match.status}</Badge>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4 items-center">
              {[{ t: a, inn: aInn }, null, { t: b, inn: bInn }].map((x, i) => {
                if (x === null) return <div key={i} className="text-center text-2xl font-black text-muted-foreground">VS</div>;
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden flex items-center justify-center text-white font-black text-2xl border-4 border-background shadow-xl" style={{ background: x.t?.color_primary || "#444" }}>
                      {x.t?.logo_url ? <img src={x.t.logo_url} alt={x.t.name} className="w-full h-full object-cover" /> : (x.t?.short_name || x.t?.name?.[0])}
                    </div>
                    <h2 className="font-bold text-sm sm:text-lg">{x.t?.name || "TBA"}</h2>
                    {x.inn && (
                      <div>
                        <span className="text-3xl sm:text-4xl font-black tabular-nums">{x.inn.runs}/{x.inn.wickets}</span>
                        <span className="text-sm text-muted-foreground ml-2">({formatOvers(x.inn.overs)} ov)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {match.result_text && <p className="text-center mt-4 text-accent font-semibold">{match.result_text}</p>}
            {match.commentary_note && <p className="text-center mt-3 text-sm text-muted-foreground italic">"{match.commentary_note}"</p>}

            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
              {match.scheduled_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(match.scheduled_at).toLocaleString()}</span>}
              {match.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.venue}</span>}
            </div>
          </div>

          {embed && (
            <div className="glass-card rounded-3xl p-3 sm:p-4 mt-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Play className="h-5 w-5 text-destructive" /> Live Broadcast</h3>
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <iframe
                  src={embed}
                  title="Live broadcast"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {innings.length > 0 && (
            <div className="glass-card rounded-3xl p-5 mt-6">
              <h3 className="text-lg font-bold mb-3">Scorecard</h3>
              <div className="space-y-2">
                {innings.map(i => (
                  <div key={i.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="font-semibold text-sm">{teams[i.batting_team_id]?.name || "—"} <span className="text-xs text-muted-foreground">Inn {i.innings_no}</span></span>
                    <span className="font-bold tabular-nums">{i.runs}/{i.wickets} <span className="text-xs text-muted-foreground">({formatOvers(i.overs)} ov, {i.extras} ext)</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MatchCenter;
