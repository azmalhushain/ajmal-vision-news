import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, Newspaper, Radio, Play, MapPin, Sparkles, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import ogSports from "@/assets/og-sports.jpg";
import { MatchCard } from "@/components/sports/MatchCard";
import { motion, AnimatePresence } from "framer-motion";
import { formatOvers } from "@/lib/sportsHelpers";

const db: any = supabase;

const Sports = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tid, setTid] = useState<string>("");
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [innings, setInnings] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await db.from("tournaments").select("*").eq("is_active", true).order("display_order");
      setTournaments(data || []);
      if (data?.length && !tid) setTid(data[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!tid) return;
    const load = async () => {
      const [{ data: t }, { data: m }, { data: n }] = await Promise.all([
        db.from("teams").select("*").eq("tournament_id", tid).eq("is_active", true).order("display_order"),
        db.from("matches").select("*").eq("tournament_id", tid).order("scheduled_at", { ascending: true }),
        db.from("sports_news").select("*").eq("tournament_id", tid).eq("status", "published").order("published_at", { ascending: false }).limit(8),
      ]);
      setTeams(t || []); setMatches(m || []); setNews(n || []);
      const ids = (m || []).map((x: any) => x.id);
      if (ids.length) {
        const { data: inn } = await db.from("match_innings").select("*").in("match_id", ids);
        setInnings(inn || []);
      } else setInnings([]);
    };
    load();
    const ch = db.channel(`sports-${tid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_innings" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, [tid]);

  const teamMap = useMemo(() => Object.fromEntries(teams.map(t => [t.id, t])), [teams]);
  const innByMatch = useMemo(() => {
    const m: Record<string, any[]> = {};
    innings.forEach(i => { (m[i.match_id] ||= []).push(i); });
    return m;
  }, [innings]);

  const live = matches.filter(m => m.status === "live");
  const upcoming = matches.filter(m => m.status === "scheduled");
  const completed = matches.filter(m => m.status === "completed");
  const tournament = tournaments.find(t => t.id === tid);
  const heroMatch = live[0] || upcoming[0] || completed[0];

  return (
    <PageTransition>
      <SEOHead
        title="KPL3 Sports Portal — Bhokraha Narsingh"
        description="Live scores, fixtures, teams and standings for the KPL3 cricket tournament hosted by Bhokraha Narsingh Municipality."
        url="/sports"
        image={ogSports}
        imageAlt="Cricket stadium under floodlights — KPL3 Sports Portal"
        keywords="KPL3, cricket, Nepal, Bhokraha Narsingh, sports, fixtures, live score"
      />
      <div className="min-h-screen pt-20 sm:pt-24 bg-background">
        {/* Stadium hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 opacity-30 bg-cover bg-center"
            style={{ backgroundImage: `url(${ogSports})` }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <div className="container mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-accent font-bold flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> Tournament
                </p>
                <h1 className="text-4xl sm:text-6xl font-black flex items-center gap-3 mt-2 leading-none">
                  <Trophy className="h-9 w-9 sm:h-12 sm:w-12 text-accent drop-shadow-[0_0_20px_hsl(var(--accent)/0.5)]" />
                  <span className="bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent">
                    {tournament?.name || "Sports"}
                  </span>
                </h1>
                {tournament?.season && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    Season {tournament.season} · <Badge variant="outline" className="capitalize">{tournament.status}</Badge>
                  </p>
                )}
              </div>
              {tournaments.length > 1 && (
                <Select value={tid} onValueChange={setTid}>
                  <SelectTrigger className="w-56 glass-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </motion.div>

            {/* Hero scoreboard */}
            {heroMatch && (
              <HeroScoreboard
                match={heroMatch}
                teamA={teamMap[heroMatch.team_a_id]}
                teamB={teamMap[heroMatch.team_b_id]}
                innings={innByMatch[heroMatch.id] || []}
              />
            )}
          </div>
        </section>

        {/* Sticky tab strip */}
        <section className="sticky top-16 sm:top-20 z-30 bg-background/85 backdrop-blur-xl border-y border-border">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="fixtures">
              <TabsList className="bg-transparent h-12 sm:h-14 p-0 gap-1 sm:gap-2 w-full justify-start overflow-x-auto">
                {[
                  { v: "fixtures", l: "Fixtures", I: Calendar },
                  { v: "teams", l: "Teams", I: Users },
                  { v: "results", l: "Results", I: Trophy },
                  { v: "news", l: "News", I: Newspaper },
                ].map(({ v, l, I }) => (
                  <TabsTrigger
                    key={v}
                    value={v}
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-full px-4 sm:px-5 h-9 sm:h-10 font-semibold text-sm whitespace-nowrap"
                  >
                    <I className="h-4 w-4 mr-1.5" /> {l}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="py-6 sm:py-10">
                <TabsContent value="fixtures" className="space-y-8 m-0">
                  {live.length > 0 && (
                    <SectionBlock label="Live now" tone="destructive">
                      <div className="grid gap-4 md:grid-cols-2">
                        {live.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />)}
                      </div>
                    </SectionBlock>
                  )}
                  <SectionBlock label="Upcoming">
                    {upcoming.length ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {upcoming.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />)}
                      </div>
                    ) : <Empty>No upcoming matches.</Empty>}
                  </SectionBlock>
                </TabsContent>

                <TabsContent value="teams" className="m-0">
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {teams.map((t, i) => <TeamCard key={t.id} team={t} index={i} />)}
                    {!teams.length && <Empty>No teams yet.</Empty>}
                  </div>
                </TabsContent>

                <TabsContent value="results" className="m-0">
                  {completed.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {completed.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />)}
                    </div>
                  ) : <Empty>No completed matches yet.</Empty>}
                </TabsContent>

                <TabsContent value="news" className="m-0">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {news.map(n => (
                      <article key={n.id} className="glass-card glass-hover rounded-2xl overflow-hidden">
                        {n.cover_url && <img src={n.cover_url} alt={n.title} className="w-full aspect-video object-cover" loading="lazy" />}
                        <div className="p-4">
                          <h3 className="font-bold line-clamp-2">{n.title}</h3>
                          {n.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.excerpt}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</p>
                        </div>
                      </article>
                    ))}
                    {!news.length && <Empty>No sports news yet.</Empty>}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </section>

        <SocialPosts />
        <Footer />
      </div>
    </PageTransition>
  );
};

const SectionBlock = ({ label, tone, children }: { label: string; tone?: "destructive"; children: React.ReactNode }) => (
  <div>
    <h2 className={`text-xs uppercase tracking-[0.3em] font-bold mb-4 flex items-center gap-2 ${tone === "destructive" ? "text-destructive" : "text-muted-foreground"}`}>
      {tone === "destructive" && <Radio className="h-3 w-3 animate-pulse" />}
      {label}
    </h2>
    {children}
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground text-center py-8 col-span-full">{children}</p>
);

const HeroScoreboard = ({ match, teamA, teamB, innings }: any) => {
  const isLive = match.status === "live";
  const isDone = match.status === "completed";
  const aInn = innings.find((i: any) => i.batting_team_id === teamA?.id);
  const bInn = innings.find((i: any) => i.batting_team_id === teamB?.id);
  const aColor = teamA?.color_primary || "hsl(var(--accent))";
  const bColor = teamB?.color_primary || "hsl(var(--primary))";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mt-6 sm:mt-8"
    >
      <Link
        to={`/sports/match/${match.id}`}
        className="block relative overflow-hidden rounded-3xl border border-border/50 group"
        style={{
          background: `linear-gradient(135deg, ${aColor}33 0%, hsl(var(--card)) 50%, ${bColor}33 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        <div className="relative p-5 sm:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              {isLive ? (
                <Badge variant="destructive" className="gap-1.5 px-3 py-1">
                  <Radio className="h-3 w-3 animate-pulse" /> LIVE
                </Badge>
              ) : isDone ? (
                <Badge variant="secondary" className="gap-1.5">FT · Result</Badge>
              ) : (
                <Badge variant="outline" className="gap-1.5"><Clock className="h-3 w-3" /> Up next</Badge>
              )}
              {match.match_no && <Badge variant="outline" className="text-[10px]">M{match.match_no}</Badge>}
            </div>
            {match.youtube_url && (
              <Button size="sm" variant="destructive" className="gap-1.5 rounded-full">
                <Play className="h-3.5 w-3.5" /> Watch
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center">
            <TeamSide team={teamA} inn={aInn} align="left" showScore={isLive || isDone} color={aColor} />

            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">vs</span>
              {!isDone && match.scheduled_at && (
                <CountdownPill target={new Date(match.scheduled_at)} live={isLive} />
              )}
            </div>

            <TeamSide team={teamB} inn={bInn} align="right" showScore={isLive || isDone} color={bColor} />
          </div>

          {(match.result_text || match.commentary_note) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 sm:mt-6 text-center text-sm sm:text-base font-semibold text-accent"
            >
              {match.result_text || match.commentary_note}
            </motion.p>
          )}

          <div className="mt-5 flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.venue || "Venue TBA"}</span>
            <span className="flex items-center gap-1 group-hover:text-accent transition-colors">
              View match centre <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const TeamSide = ({ team, inn, align, showScore, color }: any) => {
  const right = align === "right";
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${right ? "md:flex-row-reverse md:text-right" : ""}`}>
      <motion.div
        whileHover={{ scale: 1.05, rotate: right ? -3 : 3 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-xl sm:text-2xl shrink-0 border-2 border-background shadow-2xl"
        style={{ background: color }}
      >
        {team?.logo_url
          ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
          : team?.short_name || team?.name?.[0] || "?"}
      </motion.div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{team?.short_name || "TBA"}</p>
        <p className="text-base sm:text-lg font-bold truncate">{team?.name || "To be announced"}</p>
        {showScore && inn ? (
          <AnimatePresence mode="wait">
            <motion.p
              key={`${inn.runs}-${inn.wickets}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="text-2xl sm:text-4xl font-black tabular-nums mt-1"
            >
              {inn.runs}<span className="text-muted-foreground">/{inn.wickets}</span>
              <span className="text-xs sm:text-sm text-muted-foreground font-semibold ml-2">({formatOvers(inn.overs)})</span>
            </motion.p>
          </AnimatePresence>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">{team?.home_ground || "—"}</p>
        )}
      </div>
    </div>
  );
};

const CountdownPill = ({ target, live }: { target: Date; live?: boolean }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  if (live) return null;
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <div className="mt-2 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur border border-border text-xs font-bold tabular-nums flex items-center gap-1.5">
      <Clock className="h-3 w-3 text-accent" />
      {d > 0 ? `${d}d ${h}h` : `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
    </div>
  );
};

const TeamCard = ({ team, index }: { team: any; index: number }) => {
  const color = team.color_primary || "hsl(var(--accent))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="relative rounded-2xl overflow-hidden glass-card group cursor-pointer"
    >
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-60 group-hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(180deg, ${color} 0%, transparent 100%)` }}
      />
      <div className="relative p-5 text-center">
        <motion.div
          whileHover={{ rotate: 6, scale: 1.05 }}
          className="w-20 h-20 mx-auto rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-xl border-4 border-background shadow-2xl"
          style={{ background: color }}
        >
          {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> : (team.short_name || team.name?.[0])}
        </motion.div>
        <h3 className="font-bold mt-4 text-base">{team.name}</h3>
        {team.short_name && <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{team.short_name}</p>}
        {team.home_ground && <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1"><MapPin className="h-3 w-3" /> {team.home_ground}</p>}
      </div>
    </motion.div>
  );
};

const SocialPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await db.from("social_posts_cache").select("*").eq("is_hidden", false).order("posted_at", { ascending: false }).limit(6);
      setPosts(data || []);
    })();
  }, []);
  if (!posts.length) return null;
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-black mb-4">From Facebook</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(p => (
          <a key={p.id} href={p.permalink || "#"} target="_blank" rel="noopener noreferrer" className="glass-card glass-hover rounded-2xl overflow-hidden block">
            {Array.isArray(p.media_urls) && p.media_urls[0] && <img src={p.media_urls[0]} alt="" className="w-full aspect-video object-cover" loading="lazy" />}
            <div className="p-4">
              <p className="text-sm line-clamp-3">{p.message || "View on Facebook"}</p>
              <p className="text-xs text-muted-foreground mt-2">{p.posted_at ? new Date(p.posted_at).toLocaleDateString() : ""}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Sports;
