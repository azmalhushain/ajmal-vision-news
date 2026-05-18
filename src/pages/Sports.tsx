import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy, Calendar, Users, Newspaper, Radio, Play, MapPin, ArrowRight,
  Clock, Tv, BarChart3, Award, Flame,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import ogSports from "@/assets/og-sports.jpg";
import stadiumHero from "@/assets/sports-stadium-hero.jpg";
import { MatchCard } from "@/components/sports/MatchCard";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { formatOvers } from "@/lib/sportsHelpers";

const db: any = supabase;

const Sports = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tid, setTid] = useState<string>("");
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [innings, setInnings] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

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
      const [{ data: t }, { data: m }, { data: n }, { data: v }, { data: g }] = await Promise.all([
        db.from("teams").select("*").eq("tournament_id", tid).eq("is_active", true).order("display_order"),
        db.from("matches").select("*").eq("tournament_id", tid).order("scheduled_at", { ascending: true }),
        db.from("sports_news").select("*").eq("tournament_id", tid).eq("status", "published").order("published_at", { ascending: false }).limit(8),
        db.from("sports_media").select("*").eq("tournament_id", tid).eq("kind", "video").eq("is_active", true).order("is_pinned", { ascending: false }).order("display_order").limit(12),
        db.from("sports_media").select("*").eq("tournament_id", tid).eq("kind", "image").eq("is_active", true).order("is_pinned", { ascending: false }).order("display_order").limit(24),
      ]);
      setTeams(t || []); setMatches(m || []); setNews(n || []); setVideos(v || []); setGallery(g || []);
      const teamIds = (t || []).map((x: any) => x.id);
      if (teamIds.length) {
        const { data: pls } = await db.from("players").select("*").in("team_id", teamIds).eq("is_active", true);
        setPlayers(pls || []);
      } else setPlayers([]);
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
  const noResult = matches.filter(m => m.status === "abandoned" || m.status === "postponed");
  const tournament = tournaments.find(t => t.id === tid);
  const heroMatch = live[0] || upcoming[0] || completed[0];

  // Stats for hero strip
  const daysToFinal = useMemo(() => {
    if (!tournament?.end_date) return upcoming.length;
    const diff = new Date(tournament.end_date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }, [tournament, upcoming]);

  // Compute points table from completed matches: NRR (IPL style) + recent form
  const pointsTable = useMemo(() => {
    type Row = {
      team: any; m: number; w: number; l: number; nr: number; pts: number;
      runsFor: number; oversFor: number; runsAgst: number; oversAgst: number;
      form: ("W" | "L" | "N")[];
    };
    const rows: Record<string, Row> = {};
    teams.forEach(t => { rows[t.id] = { team: t, m: 0, w: 0, l: 0, nr: 0, pts: 0, runsFor: 0, oversFor: 0, runsAgst: 0, oversAgst: 0, form: [] }; });

    // Sort by date so "form" reflects chronology
    const ordered = [...matches].sort((a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime());

    for (const c of ordered) {
      const a = rows[c.team_a_id], b = rows[c.team_b_id];
      if (c.status === "completed") {
        if (a) a.m++; if (b) b.m++;
        if (c.winner_id && rows[c.winner_id]) { rows[c.winner_id].w++; rows[c.winner_id].pts += 2; rows[c.winner_id].form.push("W"); }
        const loser = c.winner_id === c.team_a_id ? c.team_b_id : c.winner_id === c.team_b_id ? c.team_a_id : null;
        if (loser && rows[loser]) { rows[loser].l++; rows[loser].form.push("L"); }
        // NRR contribution from innings
        const inns = innByMatch[c.id] || [];
        for (const inn of inns) {
          const bat = rows[inn.batting_team_id];
          const bowl = rows[inn.bowling_team_id];
          const ovs = Number(inn.overs) || 0;
          if (bat) { bat.runsFor += inn.runs || 0; bat.oversFor += ovs; }
          if (bowl) { bowl.runsAgst += inn.runs || 0; bowl.oversAgst += ovs; }
        }
      } else if (c.status === "abandoned" || c.status === "postponed") {
        // No-result: 1 point each, marks form as 'N'
        if (a) { a.m++; a.nr++; a.pts += 1; a.form.push("N"); }
        if (b) { b.m++; b.nr++; b.pts += 1; b.form.push("N"); }
      }
    }

    const out = Object.values(rows).map(r => {
      const rrFor = r.oversFor > 0 ? r.runsFor / r.oversFor : 0;
      const rrAgst = r.oversAgst > 0 ? r.runsAgst / r.oversAgst : 0;
      return { ...r, nrr: +(rrFor - rrAgst).toFixed(3), form: r.form.slice(-5) };
    });
    return out.sort((x, y) => y.pts - x.pts || y.nrr - x.nrr || y.w - x.w);
  }, [teams, matches, innByMatch]);

  return (
    <PageTransition>
      <SEOHead
        title="KPL 2025 — Live Cricket, Fixtures, Teams & Stats"
        description="The ultimate cricket showdown. Live scores, fixtures, team profiles, points table and AI-powered match insights for the KPL tournament."
        url="/sports"
        image={ogSports}
        imageAlt="KPL Cricket League 2025 — neon-green stadium banner"
        keywords="KPL, cricket, Nepal, Bhokraha Narsingh, sports, fixtures, live score, points table"
      />
      <div className="sports-theme min-h-screen pt-20 sm:pt-24 relative overflow-x-hidden">
        {/* Stadium hero */}
        <section className="relative overflow-hidden sports-stadium-bg">
          <div className="absolute inset-0 -z-10">
            <img
              src={stadiumHero}
              alt=""
              className="w-full h-full object-cover opacity-25"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--sports-bg))]/70 to-[hsl(var(--sports-bg))]" />
          </div>

          <div className="container mx-auto px-4 pt-6 pb-10 sm:pt-10 sm:pb-16 relative">
            {/* Top row: badge + tournament selector */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between gap-3 flex-wrap mb-6"
            >
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase sports-accent-text">
                <span className="h-1.5 w-1.5 rounded-full sports-accent-bg" /> Cricket League
              </span>
              {tournaments.length > 1 && (
                <Select value={tid} onValueChange={setTid}>
                  <SelectTrigger className="w-48 sports-glass border-white/10 text-[hsl(var(--sports-text))]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </motion.div>

            {/* Two-column hero: wordmark + featured rail */}
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
              {/* LEFT: wordmark + CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-black tracking-tight leading-[0.9] text-[clamp(2.75rem,9vw,6.5rem)] uppercase">
                  <span className="block">{(tournament?.name || "Cricket").split(" ")[0]}</span>
                  <span className="flex items-end gap-2 sm:gap-4 flex-wrap">
                    <span className="block">{(tournament?.name || "League").split(" ").slice(1).join(" ") || "League"}</span>
                    <span
                      className="sports-accent-text italic font-serif text-[clamp(2rem,7vw,5rem)] -mb-1 sm:-mb-2"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {tournament?.season || new Date().getFullYear()}
                    </span>
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-sm sm:text-base text-[hsl(var(--sports-muted))] leading-relaxed">
                  {tournament?.description ||
                    "The ultimate cricket showdown. Join top teams, battle for glory, and experience the thrill of every six, wicket, and victory."}
                </p>
                <div className="mt-7 flex gap-3 flex-wrap">
                  <Button
                    asChild
                    size="lg"
                    className="sports-accent-bg hover:sports-accent-bg/90 rounded-full font-bold px-7 h-12 shadow-[0_0_40px_-5px_hsl(var(--sports-accent)/0.6)]"
                  >
                    <a href="#fixtures">
                      <Trophy className="h-4 w-4 mr-2" /> Watch Fixtures
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-[hsl(var(--sports-text))] h-12 px-7 font-bold"
                  >
                    <a href="#teams">Explore Teams</a>
                  </Button>
                </div>

                {/* Stat strip */}
                <div className="mt-8 sm:mt-10 sports-glass rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Stat icon={Users} value={teams.length || 16} label="Elite Teams" />
                  <Stat icon={Trophy} value={matches.length || 48} label="Matches" />
                  <Stat icon={Calendar} value={daysToFinal || 24} label="Days Left" />
                  <Stat icon={Award} value={50} suffix="K" prefix="$" label="Prize Pool" />
                </div>
              </motion.div>

              {/* RIGHT: hero scoreboard / featured match */}
              <div>
                {heroMatch ? (
                  <HeroScoreboard
                    match={heroMatch}
                    teamA={teamMap[heroMatch.team_a_id]}
                    teamB={teamMap[heroMatch.team_b_id]}
                    innings={innByMatch[heroMatch.id] || []}
                  />
                ) : (
                  <div className="sports-glass rounded-2xl p-8 text-center text-[hsl(var(--sports-muted))]">
                    <Trophy className="h-10 w-10 mx-auto mb-3 sports-accent-text" />
                    No featured match yet — check back soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT — two columns on desktop, stacked on mobile */}
        <section className="container mx-auto px-4 py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* LEFT MAIN */}
            <div className="space-y-10 min-w-0">
              {/* Next Big Battles */}
              <div id="fixtures">
                <SectionLabel kicker="Upcoming Matches">Next Big Battles</SectionLabel>
                {upcoming.length || live.length ? (
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory scrollbar-thin">
                    {[...live, ...upcoming].slice(0, 6).map((m, i) => (
                      <div key={m.id} className="min-w-[280px] sm:min-w-0 snap-start">
                        <NeonMatchCard
                          match={m}
                          teamA={teamMap[m.team_a_id]}
                          teamB={teamMap[m.team_b_id]}
                          innings={innByMatch[m.id]}
                          index={i}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty>No upcoming matches yet.</Empty>
                )}
              </div>

              {/* Feel the Excitement band */}
              <ExcitementBand tournament={tournament} />

              {/* Tabs for full lists */}
              <div id="teams">
                <SectionLabel kicker="Browse Everything">League Hub</SectionLabel>
                <Tabs defaultValue="all-fixtures">
                  <TabsList className="bg-white/[0.04] border border-white/10 rounded-full p-1 h-auto gap-1 overflow-x-auto w-full justify-start">
                    {[
                      { v: "all-fixtures", l: "Fixtures", I: Calendar },
                      { v: "teams", l: "Teams", I: Users },
                      { v: "results", l: "Results", I: Trophy },
                      { v: "news", l: "News", I: Newspaper },
                    ].map(({ v, l, I }) => (
                      <TabsTrigger
                        key={v}
                        value={v}
                        className="rounded-full px-4 sm:px-5 h-9 font-semibold text-xs sm:text-sm whitespace-nowrap data-[state=active]:sports-accent-bg data-[state=active]:shadow-[0_0_25px_-5px_hsl(var(--sports-accent)/0.7)] text-[hsl(var(--sports-muted))] data-[state=active]:text-white"
                      >
                        <I className="h-3.5 w-3.5 mr-1.5" /> {l}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="py-6">
                    <TabsContent value="all-fixtures" className="m-0 space-y-6">
                      {live.length > 0 && (
                        <Block label="Live now" tone="live">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {live.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />)}
                          </div>
                        </Block>
                      )}
                      <Block label="Upcoming">
                        {upcoming.length ? (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {upcoming.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />)}
                          </div>
                        ) : <Empty>No upcoming matches.</Empty>}
                      </Block>
                    </TabsContent>

                    <TabsContent value="teams" className="m-0">
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {teams.map((t, i) => <NeonTeamCard key={t.id} team={t} index={i} />)}
                        {!teams.length && <Empty>No teams yet.</Empty>}
                      </div>
                    </TabsContent>

                    <TabsContent value="results" className="m-0">
                      {completed.length ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {completed.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />)}
                        </div>
                      ) : <Empty>No completed matches yet.</Empty>}
                    </TabsContent>

                    <TabsContent value="news" className="m-0">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {news.map(n => (
                          <article key={n.id} className="sports-glass sports-glow-hover rounded-2xl overflow-hidden">
                            {n.cover_url && <img src={n.cover_url} alt={n.title} className="w-full aspect-video object-cover" loading="lazy" />}
                            <div className="p-4">
                              <h3 className="font-bold line-clamp-2 text-[hsl(var(--sports-text))]">{n.title}</h3>
                              {n.excerpt && <p className="text-sm text-[hsl(var(--sports-muted))] mt-1 line-clamp-2">{n.excerpt}</p>}
                              <p className="text-xs text-[hsl(var(--sports-muted))] mt-2">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</p>
                            </div>
                          </article>
                        ))}
                        {!news.length && <Empty>No sports news yet.</Empty>}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Final CTA card */}
              <ReadyCard />
            </div>

            {/* RIGHT RAIL */}
            <aside className="space-y-6 lg:sticky lg:top-24 self-start">
              <FeaturedTeamsRail teams={teams} />
              <PointsTableCompact rows={pointsTable} />
            </aside>
          </div>
        </section>

        <StatsLeaderboards players={players} teams={teams} />
        <VideosShowcase videos={videos} />
        <SocialPosts />
        <Footer />
      </div>
    </PageTransition>
  );
};

/* ---------- Components ---------- */

const Stat = ({ icon: Icon, value, label, prefix, suffix }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => `${prefix || ""}${Math.round(v)}${suffix || ""}`);
  useEffect(() => {
    if (inView) animate(mv, value, { duration: 1.4, ease: "easeOut" });
  }, [inView, value]);
  return (
    <div ref={ref} className="text-center">
      <Icon className="h-5 w-5 mx-auto sports-accent-text mb-1.5" />
      <motion.p className="text-2xl sm:text-3xl font-black tabular-nums text-[hsl(var(--sports-text))]">
        {display}
      </motion.p>
      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[hsl(var(--sports-muted))] mt-0.5">{label}</p>
    </div>
  );
};

const SectionLabel = ({ kicker, children }: { kicker: string; children: React.ReactNode }) => (
  <div className="mb-5 sm:mb-6">
    <p className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase sports-accent-text">
      <span className="h-1.5 w-1.5 rounded-full sports-accent-bg" /> {kicker}
    </p>
    <h2 className="text-2xl sm:text-3xl font-black mt-2 text-[hsl(var(--sports-text))]">{children}</h2>
  </div>
);

const Block = ({ label, tone, children }: { label: string; tone?: "live"; children: React.ReactNode }) => (
  <div>
    <h3 className={`text-[10px] uppercase tracking-[0.3em] font-bold mb-3 flex items-center gap-2 ${tone === "live" ? "text-destructive" : "text-[hsl(var(--sports-muted))]"}`}>
      {tone === "live" && <Radio className="h-3 w-3 animate-pulse" />} {label}
    </h3>
    {children}
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-[hsl(var(--sports-muted))] text-center py-10 sports-glass rounded-2xl">{children}</p>
);

const HeroScoreboard = ({ match, teamA, teamB, innings }: any) => {
  const isLive = match.status === "live";
  const isDone = match.status === "completed";
  const aInn = innings.find((i: any) => i.batting_team_id === teamA?.id);
  const bInn = innings.find((i: any) => i.batting_team_id === teamB?.id);
  const aColor = teamA?.color_primary || "#1e88ff";
  const bColor = teamB?.color_primary || "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <Link
        to={`/sports/match/${match.id}`}
        className="block relative overflow-hidden rounded-3xl sports-glass sports-glow group"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `linear-gradient(135deg, ${aColor}66, transparent 50%, ${bColor}66)` }}
        />
        <div className="relative p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            {isLive ? (
              <Badge variant="destructive" className="gap-1.5 px-3"><Radio className="h-3 w-3 animate-pulse" /> LIVE</Badge>
            ) : isDone ? (
              <Badge variant="secondary" className="bg-white/10 text-[hsl(var(--sports-text))]">FT</Badge>
            ) : (
              <Badge variant="outline" className="border-white/20 text-[hsl(var(--sports-text))] gap-1"><Clock className="h-3 w-3" /> Up Next</Badge>
            )}
            {match.match_no && <span className="text-[10px] font-bold text-[hsl(var(--sports-muted))]">M{match.match_no}</span>}
          </div>

          <div className="space-y-4">
            {[{ t: teamA, inn: aInn, c: aColor }, { t: teamB, inn: bInn, c: bColor }].map(({ t, inn, c }, i) => (
              <div key={i} className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black shrink-0 border-2 border-white/10 shadow-xl"
                  style={{ background: c }}
                >
                  {t?.logo_url ? <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" /> : (t?.short_name || t?.name?.[0] || "?")}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--sports-muted))] font-bold">{t?.short_name || "TBA"}</p>
                  <p className="font-bold truncate text-[hsl(var(--sports-text))]">{t?.name || "To be announced"}</p>
                </div>
                {(isLive || isDone) && inn ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${inn.runs}-${inn.wickets}`}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-right"
                    >
                      <p className="text-2xl font-black tabular-nums sports-accent-text">{inn.runs}<span className="text-[hsl(var(--sports-muted))]">/{inn.wickets}</span></p>
                      <p className="text-[10px] text-[hsl(var(--sports-muted))]">({formatOvers(inn.overs)} ov)</p>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  !isDone && match.scheduled_at && i === 0 && <CountdownPill target={new Date(match.scheduled_at)} />
                )}
              </div>
            ))}
          </div>

          {match.result_text && (
            <p className="mt-4 text-center text-sm font-bold sports-accent-text">{match.result_text}</p>
          )}

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[hsl(var(--sports-muted))]">
            <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {match.venue || "Venue TBA"}</span>
            <span className="flex items-center gap-1 group-hover:sports-accent-text transition">
              Match Centre <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const CountdownPill = ({ target }: { target: Date }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return (
    <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tabular-nums text-[hsl(var(--sports-accent))] flex items-center gap-1">
      <Clock className="h-3 w-3" /> {d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`}
    </div>
  );
};

const NeonMatchCard = ({ match, teamA, teamB, innings = [], index }: any) => {
  const isLive = match.status === "live";
  const aColor = teamA?.color_primary || "#1e88ff";
  const bColor = teamB?.color_primary || "#3b82f6";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      <Link to={`/sports/match/${match.id}`} className="block sports-glass sports-glow-hover rounded-2xl p-4 sm:p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-[hsl(var(--sports-muted))]">{match.match_no ? `Match ${match.match_no}` : "Fixture"}</span>
          {isLive && <Badge variant="destructive" className="text-[10px] gap-1"><Radio className="h-3 w-3 animate-pulse" /> LIVE</Badge>}
        </div>
        <div className="flex items-center justify-around gap-2">
          <TeamBadge team={teamA} color={aColor} />
          <span className="text-[10px] font-black tracking-widest text-[hsl(var(--sports-muted))]">VS</span>
          <TeamBadge team={teamB} color={bColor} />
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-xs text-[hsl(var(--sports-muted))]">
          {match.scheduled_at && (
            <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3 sports-accent-text" /> {new Date(match.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
          )}
          {match.venue && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 sports-accent-text" /> {match.venue}</p>}
        </div>
        <div className="mt-4 sports-accent-bg rounded-full py-2 text-center text-xs font-bold flex items-center justify-center gap-1.5">
          {isLive ? <><Radio className="h-3 w-3" /> Watch Live</> : <><Tv className="h-3 w-3" /> Watch Live</>}
        </div>
      </Link>
    </motion.div>
  );
};

const TeamBadge = ({ team, color }: any) => (
  <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
    <motion.div
      whileHover={{ rotate: 8, scale: 1.08 }}
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black border-2 border-white/10 shadow-lg"
      style={{ background: color }}
    >
      {team?.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> : (team?.short_name || team?.name?.[0] || "?")}
    </motion.div>
    <span className="text-xs font-bold text-[hsl(var(--sports-text))] text-center truncate w-full">{team?.short_name || team?.name || "TBA"}</span>
  </div>
);

const NeonTeamCard = ({ team, index }: { team: any; index: number }) => {
  const color = team.color_primary || "#1e88ff";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="relative rounded-2xl overflow-hidden sports-glass sports-glow-hover group"
    >
      <Link to={`/sports/team/${team.slug}`} className="block">
        <div className="absolute inset-x-0 top-0 h-24 opacity-50 group-hover:opacity-80 transition" style={{ background: `linear-gradient(180deg, ${color} 0%, transparent 100%)` }} />
        <div className="relative p-5 text-center">
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            className="w-20 h-20 mx-auto rounded-2xl overflow-hidden flex items-center justify-center text-white font-black border-4 border-[hsl(var(--sports-bg))] shadow-2xl"
            style={{ background: color }}
          >
            {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> : (team.short_name || team.name?.[0])}
          </motion.div>
          <h3 className="font-bold mt-4 text-[hsl(var(--sports-text))]">{team.name}</h3>
          {team.short_name && <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--sports-muted))] mt-0.5">{team.short_name}</p>}
          {team.home_ground && <p className="text-xs text-[hsl(var(--sports-muted))] mt-2 flex items-center justify-center gap-1"><MapPin className="h-3 w-3" /> {team.home_ground}</p>}
        </div>
      </Link>
    </motion.div>
  );
};

const FeaturedTeamsRail = ({ teams }: { teams: any[] }) => {
  const showcase = teams.slice(0, 6);
  if (!showcase.length) return null;
  return (
    <div className="sports-glass rounded-2xl p-5">
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text flex items-center gap-1.5">
        <Flame className="h-3 w-3" /> Featured Teams
      </p>
      <h3 className="text-lg font-black text-[hsl(var(--sports-text))] mt-1 mb-4">Championship Lineup</h3>
      <div className="grid grid-cols-2 gap-2">
        {showcase.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <Link
              to={`/sports/team/${t.slug}`}
              className="sports-glass rounded-xl p-3 flex flex-col items-center text-center group cursor-pointer hover:border-white/20 transition block"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-sm border border-white/10" style={{ background: t.color_primary || "#1e88ff" }}>
                {t.logo_url ? <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" /> : (t.short_name || t.name?.[0])}
              </div>
              <p className="text-xs font-bold text-[hsl(var(--sports-text))] mt-2 truncate w-full">{t.short_name || t.name}</p>
              <p className="text-[9px] text-[hsl(var(--sports-muted))] uppercase tracking-wider">{t.description?.slice(0, 18) || "Contender"}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const FormPip = ({ r }: { r: "W" | "L" | "N" }) => {
  const cls = r === "W"
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
    : r === "L"
      ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
      : "bg-white/10 text-[hsl(var(--sports-muted))] border-white/15";
  return <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full border text-[8px] font-black ${cls}`}>{r}</span>;
};

const PointsTableCompact = ({ rows }: { rows: any[] }) => (
  <div className="sports-glass rounded-2xl p-5">
    <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text flex items-center gap-1.5">
      <BarChart3 className="h-3 w-3" /> Live Leaderboard
    </p>
    <h3 className="text-lg font-black text-[hsl(var(--sports-text))] mt-1 mb-3">Points Table</h3>
    <div className="overflow-x-auto rounded-lg border border-white/5">
      <table className="w-full text-xs min-w-[420px]">
        <thead>
          <tr className="text-[9px] uppercase tracking-wider text-[hsl(var(--sports-muted))] bg-white/5">
            <th className="text-left px-2 py-2 font-bold">Team</th>
            <th className="px-1 py-2 font-bold">P</th>
            <th className="px-1 py-2 font-bold">W</th>
            <th className="px-1 py-2 font-bold">L</th>
            <th className="px-1 py-2 font-bold">NR</th>
            <th className="px-1 py-2 font-bold">NRR</th>
            <th className="px-2 py-2 font-bold text-right">Pts</th>
            <th className="px-2 py-2 font-bold text-right">Form</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {rows.slice(0, 10).map((r, i) => (
              <motion.tr
                key={r.team.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-white/5 hover:bg-white/[0.03]"
              >
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-[hsl(var(--sports-muted))] w-3">{i + 1}</span>
                    <span className="w-5 h-5 rounded overflow-hidden flex items-center justify-center text-[8px] text-white font-bold shrink-0" style={{ background: r.team.color_primary || "#1e88ff" }}>
                      {r.team.logo_url ? <img src={r.team.logo_url} alt="" className="w-full h-full object-cover" /> : (r.team.short_name?.[0] || r.team.name[0])}
                    </span>
                    <span className="font-semibold text-[hsl(var(--sports-text))] truncate text-[11px]">{r.team.short_name || r.team.name}</span>
                  </div>
                </td>
                <td className="px-1 py-2.5 text-center tabular-nums text-[hsl(var(--sports-muted))]">{r.m}</td>
                <td className="px-1 py-2.5 text-center tabular-nums text-[hsl(var(--sports-muted))]">{r.w}</td>
                <td className="px-1 py-2.5 text-center tabular-nums text-[hsl(var(--sports-muted))]">{r.l}</td>
                <td className="px-1 py-2.5 text-center tabular-nums text-[hsl(var(--sports-muted))]">{r.nr || 0}</td>
                <td className={`px-1 py-2.5 text-center tabular-nums font-semibold ${r.nrr > 0 ? "text-emerald-400" : r.nrr < 0 ? "text-rose-400" : "text-[hsl(var(--sports-muted))]"}`}>
                  {r.nrr > 0 ? "+" : ""}{(r.nrr ?? 0).toFixed(2)}
                </td>
                <td className="px-2 py-2.5 text-right font-black tabular-nums sports-accent-text">{r.pts}</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-0.5 justify-end">
                    {(r.form || []).map((f: any, idx: number) => <FormPip key={idx} r={f} />)}
                    {!r.form?.length && <span className="text-[hsl(var(--sports-muted))] text-[10px]">—</span>}
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
          {!rows.length && (
            <tr><td colSpan={8} className="text-center text-[hsl(var(--sports-muted))] py-6 text-xs">Standings update after matches.</td></tr>
          )}
        </tbody>
      </table>
    </div>
    <p className="text-[10px] text-[hsl(var(--sports-muted))] mt-3 leading-relaxed">
      NRR auto-calculated from innings totals. Abandoned/postponed matches award 1 point to each team.
    </p>
  </div>
);

const ExcitementBand = ({ tournament }: any) => {
  const features = [
    { I: Tv, title: "Live Streaming", desc: "Catch every match live, anywhere in the world." },
    { I: BarChart3, title: "Real-Time Stats", desc: "Ball-by-ball updates, scores, and AI insights." },
    { I: Award, title: "Exclusive Rewards", desc: "Win prizes, unlock badges, and climb the leaderboard." },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.2fr] items-center sports-glass rounded-3xl overflow-hidden">
      <div className="relative aspect-video md:aspect-auto md:h-full min-h-[220px]">
        <img src={stadiumHero} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--sports-bg))] via-transparent to-transparent" />
        <button className="absolute inset-0 flex items-center justify-center group">
          <span className="w-14 h-14 rounded-full sports-accent-bg flex items-center justify-center shadow-[0_0_40px_-5px_hsl(var(--sports-accent)/0.8)] group-hover:scale-110 transition">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </span>
        </button>
      </div>
      <div className="p-5 sm:p-7">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text">The Tournament</p>
        <h3 className="text-2xl sm:text-3xl font-black mt-2 text-[hsl(var(--sports-text))]">Feel the Excitement</h3>
        <p className="text-sm text-[hsl(var(--sports-muted))] mt-2 leading-relaxed">
          From packed stadiums to last-over thrillers — experience cricket like never before. Live matches, real-time updates, and non-stop action.
        </p>
        <ul className="mt-5 space-y-3">
          {features.map(({ I, title, desc }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3"
            >
              <span className="w-9 h-9 rounded-xl sports-glass flex items-center justify-center shrink-0">
                <I className="h-4 w-4 sports-accent-text" />
              </span>
              <div>
                <p className="font-bold text-sm text-[hsl(var(--sports-text))]">{title}</p>
                <p className="text-xs text-[hsl(var(--sports-muted))]">{desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ReadyCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative overflow-hidden rounded-3xl sports-glass sports-glow p-7 sm:p-10 text-center"
  >
    <div className="absolute inset-0 opacity-30 sports-stadium-bg" />
    <div className="relative">
      <Trophy className="h-12 w-12 mx-auto sports-accent-text drop-shadow-[0_0_30px_hsl(var(--sports-accent)/0.7)]" />
      <h3 className="text-3xl sm:text-4xl font-black mt-4 text-[hsl(var(--sports-text))]">
        Ready for the <span className="sports-accent-text italic font-serif" style={{ fontFamily: "Georgia, serif" }}>Challenge?</span>
      </h3>
      <p className="text-sm text-[hsl(var(--sports-muted))] max-w-md mx-auto mt-3">
        Join the league, pick your squad, and start your journey to victory. The trophy is waiting.
      </p>
      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        <Button asChild className="sports-accent-bg rounded-full font-bold h-11 px-7 hover:opacity-90">
          <a href="#fixtures">Join Now</a>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/5 text-[hsl(var(--sports-text))] hover:bg-white/10 h-11 px-7 font-bold">
          <a href="#teams">View Schedule</a>
        </Button>
      </div>
    </div>
  </motion.div>
);

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
    <section className="container mx-auto px-4 pb-14">
      <SectionLabel kicker="Social">From Facebook</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map(p => (
          <a key={p.id} href={p.permalink || "#"} target="_blank" rel="noopener noreferrer" className="sports-glass sports-glow-hover rounded-2xl overflow-hidden block">
            {Array.isArray(p.media_urls) && p.media_urls[0] && <img src={p.media_urls[0]} alt="" className="w-full aspect-video object-cover" loading="lazy" />}
            <div className="p-4">
              <p className="text-sm line-clamp-3 text-[hsl(var(--sports-text))]">{p.message || "View on Facebook"}</p>
              <p className="text-xs text-[hsl(var(--sports-muted))] mt-2">{p.posted_at ? new Date(p.posted_at).toLocaleDateString() : ""}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

/* ---------- Stats Leaderboards ---------- */
const StatsLeaderboards = ({ players, teams }: { players: any[]; teams: any[] }) => {
  const teamMap = useMemo(() => Object.fromEntries(teams.map(t => [t.id, t])), [teams]);
  if (!players?.length) return null;

  const numeric = (v: any) => (typeof v === "number" ? v : parseFloat(v) || 0);
  const enrich = (p: any) => ({ ...p, _s: p.stats || {} });

  const topRuns = [...players].map(enrich).filter(p => numeric(p._s.runs) > 0).sort((a, b) => numeric(b._s.runs) - numeric(a._s.runs)).slice(0, 5);
  const topWickets = [...players].map(enrich).filter(p => numeric(p._s.wickets) > 0).sort((a, b) => numeric(b._s.wickets) - numeric(a._s.wickets)).slice(0, 5);
  const topSixes = [...players].map(enrich).filter(p => numeric(p._s.sixes) > 0).sort((a, b) => numeric(b._s.sixes) - numeric(a._s.sixes)).slice(0, 5);
  const topCatches = [...players].map(enrich).filter(p => numeric(p._s.catches) > 0).sort((a, b) => numeric(b._s.catches) - numeric(a._s.catches)).slice(0, 5);

  const boards = [
    { key: "runs", title: "Top Run Scorers", icon: "🏏", stat: "runs", suffix: "", rows: topRuns, sub: (s: any) => `SR ${s.sr ?? "—"} · Avg ${s.avg ?? "—"}` },
    { key: "wickets", title: "Top Wicket Takers", icon: "🎯", stat: "wickets", suffix: "", rows: topWickets, sub: (s: any) => `Econ ${s.economy ?? "—"} · BBF ${s.bbf ?? "—"}` },
    { key: "sixes", title: "Six Hitters", icon: "💥", stat: "sixes", suffix: "", rows: topSixes, sub: (s: any) => `4s ${s.fours ?? 0}` },
    { key: "catches", title: "Top Fielders", icon: "🧤", stat: "catches", suffix: "", rows: topCatches, sub: (s: any) => `RO ${s.run_outs ?? 0}${s.stumpings ? ` · St ${s.stumpings}` : ""}` },
  ];

  if (!boards.some(b => b.rows.length)) return null;

  return (
    <section className="container mx-auto px-4 py-10 sm:py-14">
      <SectionLabel kicker="Performance">Tournament Leaderboards</SectionLabel>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {boards.filter(b => b.rows.length).map((b, bi) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: bi * 0.08 }}
            className="sports-glass sports-glow-hover rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text">{b.icon} {b.stat}</p>
                <h3 className="text-base font-black text-[hsl(var(--sports-text))] mt-0.5">{b.title}</h3>
              </div>
            </div>
            <ol className="space-y-2.5">
              {b.rows.map((p, i) => {
                const team = teamMap[p.team_id];
                const color = team?.color_primary || "#1e88ff";
                return (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/sports/player/${p.slug}`} className="flex items-center gap-3 group">
                      <span className={`w-5 text-center text-xs font-black ${i === 0 ? "sports-accent-text" : "text-[hsl(var(--sports-muted))]"}`}>{i + 1}</span>
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center text-white text-[10px] font-bold shrink-0 bg-black/40 border border-white/10" style={{ borderColor: color }}>
                        {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-contain bg-black/30" /> : (p.jersey_number ?? p.name?.[0])}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[hsl(var(--sports-text))] truncate group-hover:sports-accent-text transition">{p.name}</p>
                        <p className="text-[10px] text-[hsl(var(--sports-muted))] truncate">{team?.short_name || "—"} · {b.sub(p._s)}</p>
                      </div>
                      <CountUp value={Number(p._s[b.stat]) || 0} className="text-xl font-black tabular-nums sports-accent-text" />
                    </Link>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const CountUp = ({ value, className }: { value: number; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const display = useTransform(mv, v => Math.round(v).toString());
  useEffect(() => { if (inView) animate(mv, value, { duration: 1.2, ease: "easeOut" }); }, [inView, value]);
  return <motion.span ref={ref} className={className}>{display}</motion.span>;
};

/* ---------- Videos Showcase ---------- */
const VideosShowcase = ({ videos }: { videos: any[] }) => {
  const [active, setActive] = useState<any | null>(null);
  if (!videos?.length) return null;

  const ytEmbed = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
      return url.replace("watch?v=", "embed/");
    } catch { return url; }
  };

  return (
    <section className="container mx-auto px-4 py-10 sm:py-14">
      <SectionLabel kicker="Watch">Videos & Highlights</SectionLabel>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="sports-glass sports-glow-hover rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => setActive(v)}
          >
            <div className="relative bg-black flex items-center justify-center" style={{ minHeight: 180 }}>
              {v.thumbnail_url ? (
                <img src={v.thumbnail_url} alt={v.caption || ""} className="w-full max-h-60 object-contain" loading="lazy" />
              ) : v.source === "upload" ? (
                <video src={v.url} className="w-full max-h-60 object-contain" preload="metadata" muted />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-[hsl(var(--sports-accent)/0.3)] to-black" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                <motion.span whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full sports-accent-bg flex items-center justify-center shadow-[0_0_40px_-5px_hsl(var(--sports-accent)/0.8)]">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </motion.span>
              </div>
            </div>
            <div className="p-4">
              <p className="font-bold text-sm text-[hsl(var(--sports-text))] line-clamp-1">{v.caption || "Untitled clip"}</p>
              <p className="text-[10px] text-[hsl(var(--sports-muted))] mt-1 uppercase tracking-wider">{v.source === "youtube" ? "YouTube" : "Tournament video"}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              {active.source === "youtube"
                ? <iframe src={`${ytEmbed(active.url)}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
                : <video src={active.url} className="w-full h-full object-contain" controls autoPlay />}
            </div>
            {active.caption && <p className="text-center text-white mt-3 font-medium">{active.caption}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default Sports;
