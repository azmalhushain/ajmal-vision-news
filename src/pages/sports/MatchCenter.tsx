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

          {/* Broadcast + live side panel — fills space across the row */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className={`${embed ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
              {embed ? (
                <div className="glass-card rounded-3xl p-3 sm:p-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Play className="h-5 w-5 text-destructive" /> Live Broadcast
                    {isLive && <Badge variant="destructive" className="gap-1 ml-1"><Radio className="h-3 w-3 animate-pulse" /> ON AIR</Badge>}
                  </h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={embed}
                      title="Live broadcast"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">No live broadcast available for this match.</p>
                </div>
              )}

              {innings.length > 0 && (
                <div className="glass-card rounded-3xl p-5">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" /> Scorecard
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {innings.map(i => {
                      const t = teams[i.batting_team_id];
                      return (
                        <div key={i.id} className="rounded-2xl p-4 bg-background/40 border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-xs" style={{ background: t?.color_primary || "#444" }}>
                              {t?.logo_url ? <img src={t.logo_url} alt="" className="w-full h-full object-cover" /> : (t?.short_name || t?.name?.[0])}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{t?.name || "—"}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Innings {i.innings_no}</p>
                            </div>
                          </div>
                          <p className="text-3xl font-black tabular-nums">{i.runs}/{i.wickets}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatOvers(i.overs)} ov · {i.extras} extras</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Side panel — only when there's a broadcast to balance with */}
            {embed && (
              <aside className="space-y-4">
                <div className="glass-card rounded-3xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-2">Match Status</p>
                  <p className="text-2xl font-black capitalize">{isLive ? "Live now" : match.status}</p>
                  {match.result_text && <p className="text-sm text-muted-foreground mt-2">{match.result_text}</p>}
                  {match.commentary_note && (
                    <p className="text-sm italic mt-3 border-l-2 border-accent/60 pl-3 text-muted-foreground">"{match.commentary_note}"</p>
                  )}
                </div>

                <div className="glass-card rounded-3xl p-5 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Match Info</p>
                  {match.scheduled_at && (
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                      <span>{new Date(match.scheduled_at).toLocaleString()}</span>
                    </div>
                  )}
                  {match.venue && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                      <span>{match.venue}</span>
                    </div>
                  )}
                  {match.match_no && (
                    <div className="flex items-start gap-2 text-sm">
                      <Radio className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                      <span>Match #{match.match_no}</span>
                    </div>
                  )}
                </div>

                {aInn && bInn && (
                  <div className="glass-card rounded-3xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3">Head to Head</p>
                    <div className="space-y-2">
                      {[{ t: a, inn: aInn }, { t: b, inn: bInn }].map((row, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold truncate">{row.t?.short_name || row.t?.name}</span>
                          <span className="text-sm font-black tabular-nums">{row.inn.runs}/{row.inn.wickets}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            )}
          </div>

        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MatchCenter;
