import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy, Calendar, Users, Newspaper, Radio, Play, MapPin, ArrowRight,
  Clock, Tv, BarChart3, Award, Flame, Loader2, AlertTriangle, RefreshCw,
  Activity, Star, Zap, Target, TrendingUp, CalendarDays, CircleDot,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import ogSports from "@/assets/og-sports.jpg";
import stadiumHero from "@/assets/sports-stadium-hero.jpg";
import { MatchCard } from "@/components/sports/MatchCard";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { formatOvers } from "@/lib/sportsHelpers";

const db: any = supabase;

const Sports = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tid, setTid] = useState<string>("");
  const [introVideoOpen, setIntroVideoOpen] = useState(false);
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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (!tid) return;
    let cancelled = false;
    const load = async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const results = await Promise.all([
          db.from("teams").select("*").eq("tournament_id", tid).eq("is_active", true).order("display_order"),
          db.from("matches").select("*").eq("tournament_id", tid).order("scheduled_at", { ascending: true }),
          db.from("sports_news").select("*").eq("tournament_id", tid).eq("status", "published").order("published_at", { ascending: false }).limit(8),
          db.from("sports_media").select("*").eq("tournament_id", tid).eq("kind", "video").eq("is_active", true).order("is_pinned", { ascending: false }).order("display_order").limit(12),
          db.from("sports_media").select("*").eq("tournament_id", tid).eq("kind", "image").eq("is_active", true).order("is_pinned", { ascending: false }).order("display_order").limit(24),
        ]);
        const firstErr = results.find((r: any) => r.error)?.error;
        if (firstErr) throw firstErr;
        const [{ data: t }, { data: m }, { data: n }, { data: v }, { data: g }] = results as any;
        if (cancelled) return;
        setTeams(t || []); setMatches(m || []); setNews(n || []); setVideos(v || []); setGallery(g || []);
        const teamIds = (t || []).map((x: any) => x.id);
        if (teamIds.length) {
          const { data: pls } = await db.from("players").select("*").in("team_id", teamIds).eq("is_active", true);
          if (!cancelled) setPlayers(pls || []);
        } else setPlayers([]);
        const ids = (m || []).map((x: any) => x.id);
        if (ids.length) {
          const { data: inn } = await db.from("match_innings").select("*").in("match_id", ids);
          if (!cancelled) setInnings(inn || []);
        } else setInnings([]);
        if (!cancelled) setLoadError(null);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || "Failed to load match data");
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };
    load();
    const intervalId = setInterval(() => load(true), 30000);
    const ch = db.channel(`sports-${tid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => load(true))
      .on("postgres_changes", { event: "*", schema: "public", table: "match_innings" }, () => load(true))
      .subscribe();
    return () => { cancelled = true; clearInterval(intervalId); db.removeChannel(ch); };
  }, [tid, retryNonce]);

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
        {/* ============ CINEMATIC BENTO HERO ============ */}
        <section className="relative overflow-hidden sports-stadium-bg">
          {/* Backdrop layers */}
          <div className="absolute inset-0 -z-10">
            <img
              src={stadiumHero}
              alt=""
              className="w-full h-full object-cover opacity-[0.18]"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,hsl(var(--sports-bg))_75%)]" />
            {/* Floating accent orbs */}
            <motion.div
              aria-hidden
              className="absolute -top-32 -left-20 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
              style={{ background: "radial-gradient(circle, hsl(var(--sports-accent)) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="absolute top-1/3 -right-32 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, hsl(var(--sports-accent-glow)) 0%, transparent 70%)" }}
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="container mx-auto px-4 pt-4 pb-8 sm:pt-8 sm:pb-14 relative">
            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between gap-3 flex-wrap mb-6 sm:mb-8"
            >
              <div className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full sports-accent-bg opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sports-accent-bg" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] uppercase sports-accent-text">
                  Cricket League · Season {tournament?.season || new Date().getFullYear()}
                </span>
              </div>
              {tournaments.length > 1 && (
                <Select value={tid} onValueChange={setTid}>
                  <SelectTrigger className="w-48 sports-glass border-white/10 text-[hsl(var(--sports-text))] rounded-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </motion.div>

            {/* BENTO GRID — 2 cols mobile, 12 cols desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-4 auto-rows-auto">
              {/* MAIN WORDMARK TILE */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="col-span-2 lg:col-span-8 relative overflow-hidden rounded-3xl sports-glass p-5 sm:p-8 lg:p-10 min-h-[320px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-between group"
              >
                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 sports-accent-text border-current opacity-60" />
                <div className="absolute top-3 right-3 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 sports-accent-text border-current opacity-60" />
                <div className="absolute bottom-3 left-3 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 sports-accent-text border-current opacity-60" />
                <div className="absolute bottom-3 right-3 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 sports-accent-text border-current opacity-60" />

                {/* Gradient wash */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--sports-accent))]/10 via-transparent to-[hsl(var(--sports-accent-glow))]/5 pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3 sm:mb-6">
                    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent via-[hsl(var(--sports-accent))] to-transparent" />
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.35em] sm:tracking-[0.4em] uppercase text-[hsl(var(--sports-muted))]">Now Live</span>
                  </div>

                  <h1 className="font-black tracking-[-0.02em] leading-[0.88] sm:leading-[0.85] text-[clamp(2rem,11vw,6.5rem)] uppercase break-words">
                    <span className="block bg-gradient-to-r from-[hsl(var(--sports-text))] via-[hsl(var(--sports-text))] to-[hsl(var(--sports-text))]/70 bg-clip-text text-transparent">
                      {(tournament?.name || "Cricket").split(" ")[0]}
                    </span>
                    <span className="flex items-baseline gap-2 sm:gap-4 flex-wrap mt-1">
                      <span className="block">{(tournament?.name || "League").split(" ").slice(1).join(" ") || "League"}</span>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="sports-accent-text italic text-[clamp(1.5rem,7vw,4.5rem)] leading-none"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        '{String(tournament?.season || new Date().getFullYear()).slice(-2)}
                      </motion.span>
                    </span>
                  </h1>

                  <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-base text-[hsl(var(--sports-muted))] leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {tournament?.description ||
                      "The ultimate cricket showdown. Top teams battle for glory across every six, wicket and roaring crowd."}
                  </p>
                </div>

                <div className="relative mt-5 sm:mt-7">
                  <div className="flex gap-2 sm:gap-2.5 flex-wrap">
                    <Button
                      asChild
                      size="lg"
                      className="sports-accent-bg hover:sports-accent-bg/90 rounded-full font-bold px-4 sm:px-7 h-10 sm:h-12 text-xs sm:text-sm shadow-[0_0_40px_-5px_hsl(var(--sports-accent)/0.7)] group/btn"
                    >
                      <a href="#fixtures">
                        <Trophy className="h-4 w-4 mr-1.5 sm:mr-2 group-hover/btn:rotate-12 transition" /> Fixtures
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-[hsl(var(--sports-text))] h-10 sm:h-12 px-4 sm:px-7 text-xs sm:text-sm font-bold"
                    >
                      <a href="#teams">
                        Teams <ArrowRight className="h-4 w-4 ml-1.5 sm:ml-2" />
                      </a>
                    </Button>
                    {tournament?.intro_video_url && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setIntroVideoOpen(true)}
                        className="rounded-full border-[hsl(var(--sports-accent))]/40 bg-[hsl(var(--sports-accent))]/10 hover:bg-[hsl(var(--sports-accent))]/20 text-[hsl(var(--sports-text))] h-10 sm:h-12 px-4 sm:px-7 text-xs sm:text-sm font-bold"
                      >
                        <Play className="h-4 w-4 mr-1.5 sm:mr-2 fill-current sports-accent-text" /> Intro
                      </Button>
                    )}
                  </div>
                  {tournament?.tagline && (
                    <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs sports-accent-text font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase line-clamp-2">— {tournament.tagline}</p>
                  )}
                </div>
              </motion.div>

              {/* SCOREBOARD TILE */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="col-span-2 lg:col-span-4 relative"
              >
                {/* live refresh indicator */}
                {isRefreshing && (
                  <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 text-[10px] font-bold sports-accent-text bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <Loader2 className="h-3 w-3 animate-spin" /> Refreshing
                  </div>
                )}
                {loadError ? (
                  <div className="sports-glass rounded-3xl p-6 sm:p-8 text-center h-full flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
                    <AlertTriangle className="h-10 w-10 mb-3 text-destructive" />
                    <p className="font-bold text-[hsl(var(--sports-text))] text-sm">Could not load match data</p>
                    <p className="text-xs mt-1 text-[hsl(var(--sports-muted))] max-w-xs">{loadError}</p>
                    <Button
                      size="sm"
                      onClick={() => setRetryNonce(n => n + 1)}
                      className="mt-4 rounded-full sports-accent-bg font-bold h-9 px-5"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
                    </Button>
                  </div>
                ) : heroMatch ? (
                  <HeroScoreboard
                    match={heroMatch}
                    teamA={teamMap[heroMatch.team_a_id]}
                    teamB={teamMap[heroMatch.team_b_id]}
                    innings={innByMatch[heroMatch.id] || []}
                  />
                ) : isRefreshing ? (
                  <div className="sports-glass rounded-3xl p-6 sm:p-8 text-center h-full flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
                    <Loader2 className="h-10 w-10 mb-3 sports-accent-text animate-spin" />
                    <p className="font-bold text-[hsl(var(--sports-text))] text-sm">Loading featured match…</p>
                  </div>
                ) : (
                  <div className="sports-glass rounded-3xl p-6 sm:p-8 text-center text-[hsl(var(--sports-muted))] h-full flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
                    <Trophy className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sports-accent-text" />
                    <p className="font-bold text-[hsl(var(--sports-text))] text-sm">Featured match coming soon</p>
                    <p className="text-xs mt-1">Check back at first whistle</p>
                  </div>
                )}
              </motion.div>

              {/* STAT BENTO TILES — 2 per row mobile, 4 per row desktop */}
              {[
                { I: Users, v: teams.length || 16, l: "Elite Teams" },
                { I: Trophy, v: matches.length || 48, l: "Matches" },
                { I: Calendar, v: daysToFinal || 24, l: "Days Left" },
                { I: Award, v: 50, suffix: "K", prefix: "$", l: "Prize Pool" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="col-span-1 lg:col-span-3 sports-glass sports-glow-hover rounded-2xl p-4 sm:p-6 relative overflow-hidden group min-h-[110px] sm:min-h-[130px] flex items-center justify-center"
                >
                  <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[hsl(var(--sports-accent))]/5 group-hover:bg-[hsl(var(--sports-accent))]/15 transition" />
                  <Stat icon={s.I} value={s.v} label={s.l} prefix={s.prefix} suffix={s.suffix} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Team marquee strip */}
          {teams.length > 0 && (
            <div className="relative border-y border-white/5 bg-black/30 backdrop-blur-sm overflow-hidden">
              <div className="flex sports-marquee-track py-4 gap-12 whitespace-nowrap">
                {[...teams, ...teams, ...teams].map((t, i) => (
                  <div key={i} className="inline-flex items-center gap-3 shrink-0">
                    <div
                      className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-white text-xs font-black border border-white/10"
                      style={{ background: t.color_primary || "hsl(var(--sports-accent))" }}
                    >
                      {t.logo_url ? <img src={t.logo_url} alt="" className="w-full h-full object-cover" /> : (t.short_name || t.name?.[0])}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[hsl(var(--sports-text))]/80">{t.name}</span>
                    <Flame className="h-3 w-3 sports-accent-text" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Sticky in-page navigation */}
        <SportsSubNav hasLive={live.length > 0} />

        {/* TOURNAMENT PROGRESS STRIP */}
        <TournamentProgressStrip
          tournament={tournament}
          matches={matches}
          completed={completed}
          live={live}
          upcoming={upcoming}
        />

        {/* MAIN CONTENT — true dashboard: 8/4 split on desktop, sidebar packed with widgets */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid gap-6 lg:gap-7 lg:grid-cols-12">
            {/* LEFT MAIN — 8 cols */}
            <div className="lg:col-span-8 space-y-10 min-w-0">
              {/* Next Big Battles */}
              <div id="fixtures">
                <SectionLabel kicker="Upcoming Matches">Next Big Battles</SectionLabel>
                {upcoming.length || live.length ? (
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 snap-x snap-mandatory scrollbar-thin">
                    {[...live, ...upcoming].slice(0, 4).map((m, i) => (
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
              <ExcitementBand tournament={tournament} onPlay={() => setIntroVideoOpen(true)} />

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

            {/* RIGHT RAIL — 4 cols, sticky, packed with widgets */}
            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-36 self-start max-h-[calc(100vh-9rem)] lg:overflow-y-auto pr-1 scrollbar-thin">
              <NextMatchSpotlight upcoming={upcoming} teamMap={teamMap} />
              <PlayerOfTheWeek players={players} teamMap={teamMap} />
              <QuickInsights matches={matches} players={players} innings={innings} />
              <RecentResultsStrip completed={completed} teamMap={teamMap} innByMatch={innByMatch} />
              <FeaturedTeamsRail teams={teams} />
              <PointsTableCompact rows={pointsTable} />
            </aside>
          </div>
        </section>


        <div id="stats"><StatsLeaderboards players={players} teams={teams} /></div>
        <div id="videos"><VideosShowcase videos={videos} /></div>
        <div id="gallery"><GalleryShowcase images={gallery} /></div>
        <SocialPosts />
        <Footer />
        {tournament?.intro_video_url && (
          <VideoPlayerModal
            isOpen={introVideoOpen}
            onClose={() => setIntroVideoOpen(false)}
            videoUrl={tournament.intro_video_url}
            title={`${tournament.name || "Tournament"} — Intro`}
          />
        )}
      </div>
    </PageTransition>
  );
};

/* ---------- Components ---------- */

const SUB_NAV_ITEMS = [
  { id: "fixtures", label: "Fixtures", I: Calendar },
  { id: "teams", label: "Teams", I: Users },
  { id: "stats", label: "Stats", I: BarChart3 },
  { id: "videos", label: "Videos", I: Play },
  { id: "gallery", label: "Gallery", I: Award },
];

const SportsSubNav = ({ hasLive }: { hasLive: boolean }) => {
  const [active, setActive] = useState<string>("fixtures");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    SUB_NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  return (
    <div className="sticky top-16 sm:top-20 z-30 bg-[hsl(var(--sports-bg))]/85 backdrop-blur-xl border-y border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-2.5">
          {hasLive && (
            <button
              onClick={() => go("fixtures")}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-destructive/15 border border-destructive/40 text-destructive text-xs font-bold uppercase tracking-wider"
            >
              <Radio className="h-3 w-3 animate-pulse" /> Live
            </button>
          )}
          {SUB_NAV_ITEMS.map(({ id, label, I }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                active === id
                  ? "sports-accent-bg border-transparent text-white shadow-[0_0_25px_-5px_hsl(var(--sports-accent)/0.7)]"
                  : "bg-white/[0.04] border-white/10 text-[hsl(var(--sports-muted))] hover:text-[hsl(var(--sports-text))] hover:border-white/20"
              }`}
            >
              <I className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};



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

const ExcitementBand = ({ tournament, onPlay }: any) => {
  const features = [
    { I: Tv, title: "Live Streaming", desc: "Catch every match live, anywhere in the world." },
    { I: BarChart3, title: "Real-Time Stats", desc: "Ball-by-ball updates, scores, and AI insights." },
    { I: Award, title: "Exclusive Rewards", desc: "Win prizes, unlock badges, and climb the leaderboard." },
  ];
  const hasVideo = !!tournament?.intro_video_url;
  const poster = tournament?.banner_url || stadiumHero;
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.2fr] items-stretch sports-glass rounded-3xl overflow-hidden">
      <div className="relative aspect-video md:aspect-auto md:h-full min-h-[260px] group">
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--sports-bg))]/70 via-[hsl(var(--sports-bg))]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--sports-bg))]/80 via-transparent to-transparent" />
        <button
          type="button"
          onClick={hasVideo ? onPlay : undefined}
          disabled={!hasVideo}
          aria-label={hasVideo ? "Play tournament intro video" : "Intro video coming soon"}
          className="absolute inset-0 flex items-center justify-center group/btn focus:outline-none"
        >
          <span className="absolute w-24 h-24 rounded-full sports-accent-bg/30 animate-ping opacity-60" />
          <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full sports-accent-bg flex items-center justify-center shadow-[0_0_60px_-5px_hsl(var(--sports-accent)/0.9)] transition-transform duration-300 group-hover/btn:scale-110 group-active/btn:scale-95">
            <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-1" />
          </span>
        </button>
        {!hasVideo && (
          <span className="absolute bottom-4 left-4 text-[10px] font-bold tracking-widest uppercase text-white/70 bg-black/40 backdrop-blur px-2 py-1 rounded">
            Intro coming soon
          </span>
        )}
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

/* ---------- NEW DASHBOARD WIDGETS ---------- */

const TournamentProgressStrip = ({ tournament, matches, completed, live, upcoming }: any) => {
  const total = matches.length || 1;
  const done = completed.length;
  const pct = Math.round((done / total) * 100);
  const startD = tournament?.start_date ? new Date(tournament.start_date) : null;
  const endD = tournament?.end_date ? new Date(tournament.end_date) : null;
  const today = new Date();
  const timePct = startD && endD
    ? Math.min(100, Math.max(0, ((today.getTime() - startD.getTime()) / (endD.getTime() - startD.getTime())) * 100))
    : pct;

  return (
    <div className="container mx-auto px-4 -mt-2 sm:-mt-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="sports-glass rounded-2xl p-4 sm:p-5 grid gap-4 md:grid-cols-[1fr_auto_auto_auto] items-center"
      >
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> Tournament Progress
            </p>
            <span className="text-[11px] font-bold sports-accent-text tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2 bg-white/5" />
          <p className="text-[10px] text-[hsl(var(--sports-muted))] mt-1.5">
            {done} of {total} matches played
            {endD && ` · Finals on ${endD.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
          </p>
        </div>
        <MiniPill icon={Radio} label="Live" value={live.length} tone="live" />
        <MiniPill icon={Clock} label="Upcoming" value={upcoming.length} />
        <MiniPill icon={Trophy} label="Done" value={done} />
      </motion.div>
    </div>
  );
};

const MiniPill = ({ icon: Icon, label, value, tone }: any) => (
  <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border ${tone === "live" ? "bg-destructive/10 border-destructive/30" : "bg-white/[0.03] border-white/10"}`}>
    <Icon className={`h-4 w-4 ${tone === "live" ? "text-destructive animate-pulse" : "sports-accent-text"}`} />
    <div className="leading-tight">
      <p className="text-base font-black tabular-nums text-[hsl(var(--sports-text))]">{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--sports-muted))]">{label}</p>
    </div>
  </div>
);

const NextMatchSpotlight = ({ upcoming, teamMap }: any) => {
  const [now, setNow] = useState(Date.now());
  const next = upcoming[0];
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  if (!next) return null;
  const a = teamMap[next.team_a_id]; const b = teamMap[next.team_b_id];
  const target = next.scheduled_at ? new Date(next.scheduled_at).getTime() : now;
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <Link to={`/sports/match/${next.id}`} className="relative block sports-glass sports-glow rounded-2xl p-5 overflow-hidden group">
      <div className="absolute inset-0 opacity-25" style={{ background: `linear-gradient(135deg, ${a?.color_primary || "#1e88ff"}, transparent 60%, ${b?.color_primary || "#3b82f6"})` }} />
      <div className="relative">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" /> Match of the Day
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <TeamMini t={a} />
          <span className="text-[10px] font-black tracking-widest text-[hsl(var(--sports-muted))]">VS</span>
          <TeamMini t={b} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl bg-black/30 border border-white/10 p-2">
          {[{ v: d, l: "D" }, { v: h, l: "H" }, { v: m, l: "M" }, { v: s, l: "S" }].map((x, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-black tabular-nums sports-accent-text">{String(x.v).padStart(2, "0")}</p>
              <p className="text-[8px] uppercase tracking-widest text-[hsl(var(--sports-muted))]">{x.l}</p>
            </div>
          ))}
        </div>
        {next.venue && <p className="text-[10px] text-[hsl(var(--sports-muted))] mt-3 flex items-center gap-1"><MapPin className="h-3 w-3" /> {next.venue}</p>}
      </div>
    </Link>
  );
};

const TeamMini = ({ t }: any) => (
  <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
    <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black border-2 border-white/10 shadow-lg" style={{ background: t?.color_primary || "#1e88ff" }}>
      {t?.logo_url ? <img src={t.logo_url} alt={t?.name} className="w-full h-full object-cover" /> : (t?.short_name || t?.name?.[0] || "?")}
    </div>
    <span className="text-[10px] font-bold text-[hsl(var(--sports-text))] truncate w-full text-center">{t?.short_name || t?.name || "TBA"}</span>
  </div>
);

const PlayerOfTheWeek = ({ players, teamMap }: { players: any[]; teamMap: any }) => {
  const top = useMemo(() => {
    if (!players?.length) return null;
    const scored = players.map((p: any) => {
      const s = p.stats || {};
      const score = (Number(s.runs) || 0) * 1 + (Number(s.wickets) || 0) * 20 + (Number(s.sixes) || 0) * 4 + (Number(s.catches) || 0) * 5;
      return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.score > 0 ? scored[0].p : null;
  }, [players]);
  if (!top) return null;
  const team = teamMap[top.team_id];
  const s = top.stats || {};

  return (
    <div className="sports-glass sports-glow rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[hsl(var(--sports-accent))]/10 blur-2xl" />
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text flex items-center gap-1.5 relative">
        <Star className="h-3 w-3 fill-current" /> Star of the Week
      </p>
      <Link to={`/sports/player/${top.slug}`} className="flex items-center gap-3 mt-3 relative group">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-white font-black border-2 shadow-lg shrink-0" style={{ background: team?.color_primary || "#1e88ff", borderColor: team?.color_primary || "#1e88ff" }}>
          {top.photo_url ? <img src={top.photo_url} alt={top.name} className="w-full h-full object-cover" /> : (top.jersey_number ?? top.name?.[0])}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[hsl(var(--sports-text))] truncate group-hover:sports-accent-text transition">{top.name}</p>
          <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--sports-muted))] truncate">{team?.short_name || team?.name || "—"} · {top.role || "Player"}</p>
        </div>
      </Link>
      <div className="grid grid-cols-3 gap-2 mt-4 relative">
        {[{ l: "Runs", v: s.runs ?? 0 }, { l: "Wkts", v: s.wickets ?? 0 }, { l: "6s", v: s.sixes ?? 0 }].map((x, i) => (
          <div key={i} className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
            <p className="text-base font-black sports-accent-text tabular-nums">{x.v}</p>
            <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--sports-muted))]">{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuickInsights = ({ matches, players, innings }: any) => {
  const totals = useMemo(() => {
    const runs = innings.reduce((a: number, i: any) => a + (Number(i.runs) || 0), 0);
    const wickets = innings.reduce((a: number, i: any) => a + (Number(i.wickets) || 0), 0);
    const sixes = players.reduce((a: number, p: any) => a + (Number(p.stats?.sixes) || 0), 0);
    const fours = players.reduce((a: number, p: any) => a + (Number(p.stats?.fours) || 0), 0);
    return { runs, wickets, sixes, fours };
  }, [matches, players, innings]);
  if (!totals.runs && !totals.wickets) return null;

  const items = [
    { I: TrendingUp, l: "Runs", v: totals.runs },
    { I: Target, l: "Wickets", v: totals.wickets },
    { I: Zap, l: "Sixes", v: totals.sixes },
    { I: CircleDot, l: "Fours", v: totals.fours },
  ];
  return (
    <div className="sports-glass rounded-2xl p-5">
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text flex items-center gap-1.5">
        <BarChart3 className="h-3 w-3" /> Tournament Pulse
      </p>
      <h3 className="text-base font-black text-[hsl(var(--sports-text))] mt-1 mb-3">Cumulative Numbers</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((x, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white/[0.03] border border-white/5 p-3 flex items-center gap-2.5"
          >
            <x.I className="h-4 w-4 sports-accent-text shrink-0" />
            <div className="min-w-0">
              <CountUp value={x.v} className="text-lg font-black tabular-nums text-[hsl(var(--sports-text))] block leading-none" />
              <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--sports-muted))] mt-1">{x.l}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RecentResultsStrip = ({ completed, teamMap, innByMatch }: any) => {
  const recent = [...completed]
    .sort((a: any, b: any) => new Date(b.scheduled_at || 0).getTime() - new Date(a.scheduled_at || 0).getTime())
    .slice(0, 4);
  if (!recent.length) return null;
  return (
    <div className="sports-glass rounded-2xl p-5">
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase sports-accent-text flex items-center gap-1.5">
        <Trophy className="h-3 w-3" /> Recent Results
      </p>
      <h3 className="text-base font-black text-[hsl(var(--sports-text))] mt-1 mb-3">Latest Verdicts</h3>
      <ul className="space-y-2">
        {recent.map(m => {
          const a = teamMap[m.team_a_id]; const b = teamMap[m.team_b_id];
          const inns = innByMatch[m.id] || [];
          const aInn = inns.find((i: any) => i.batting_team_id === m.team_a_id);
          const bInn = inns.find((i: any) => i.batting_team_id === m.team_b_id);
          return (
            <li key={m.id}>
              <Link to={`/sports/match/${m.id}`} className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition p-2.5 group">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center text-white shrink-0 overflow-hidden" style={{ background: a?.color_primary || "#1e88ff" }}>
                    {a?.logo_url ? <img src={a.logo_url} alt="" className="w-full h-full object-cover" /> : a?.short_name?.[0]}
                  </span>
                  <span className="text-[11px] font-bold text-[hsl(var(--sports-text))] truncate">{a?.short_name || "TBA"}</span>
                  {aInn && <span className="text-[10px] tabular-nums text-[hsl(var(--sports-muted))]">{aInn.runs}/{aInn.wickets}</span>}
                </div>
                <span className="text-[8px] font-black text-[hsl(var(--sports-muted))]">VS</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  {bInn && <span className="text-[10px] tabular-nums text-[hsl(var(--sports-muted))]">{bInn.runs}/{bInn.wickets}</span>}
                  <span className="text-[11px] font-bold text-[hsl(var(--sports-text))] truncate">{b?.short_name || "TBA"}</span>
                  <span className="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center text-white shrink-0 overflow-hidden" style={{ background: b?.color_primary || "#3b82f6" }}>
                    {b?.logo_url ? <img src={b.logo_url} alt="" className="w-full h-full object-cover" /> : b?.short_name?.[0]}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
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

/* ---------- Videos Showcase (modernized) ---------- */
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

  const [hero, ...rest] = videos;

  return (
    <section className="container mx-auto px-4 py-10 sm:py-14">
      <SectionLabel kicker="Watch">Videos & Highlights</SectionLabel>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Hero video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="sports-glass sports-glow-hover rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => setActive(hero)}
        >
          <div className="relative bg-black flex items-center justify-center">
            {hero.thumbnail_url ? (
              <img src={hero.thumbnail_url} alt={hero.caption || ""} className="w-full h-auto max-h-[420px] object-contain" loading="lazy" />
            ) : hero.source === "upload" ? (
              <video src={hero.url} className="w-full h-auto max-h-[420px] object-contain" preload="metadata" muted />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-[hsl(var(--sports-accent)/0.3)] to-black" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition">
              <motion.span whileHover={{ scale: 1.1 }} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full sports-accent-bg flex items-center justify-center shadow-[0_0_60px_-5px_hsl(var(--sports-accent)/0.9)]">
                <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-1" />
              </motion.span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <Badge className="sports-accent-bg mb-2 text-[10px]">FEATURED</Badge>
              <p className="font-black text-lg sm:text-2xl text-white line-clamp-2 drop-shadow-lg">{hero.caption || "Featured clip"}</p>
            </div>
          </div>
        </motion.div>

        {/* Sidebar list */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:max-h-[420px] lg:overflow-y-auto pr-1">
          {rest.slice(0, 6).map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="sports-glass sports-glow-hover rounded-xl overflow-hidden cursor-pointer group flex flex-col lg:flex-row gap-2 lg:gap-3 p-2"
              onClick={() => setActive(v)}
            >
              <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center lg:w-32 lg:shrink-0 aspect-video lg:aspect-video">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : v.source === "upload" ? (
                  <video src={v.url} className="w-full h-full object-cover" preload="metadata" muted />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--sports-accent)/0.3)] to-black" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                  <Play className="h-5 w-5 fill-white text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 px-1 py-1">
                <p className="font-bold text-xs sm:text-sm text-[hsl(var(--sports-text))] line-clamp-2">{v.caption || "Clip"}</p>
                <p className="text-[10px] text-[hsl(var(--sports-muted))] mt-1 uppercase tracking-wider">{v.source === "youtube" ? "YouTube" : "Video"}</p>
              </div>
            </motion.div>
          ))}
        </div>
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

/* ---------- Gallery Showcase (masonry, original ratios) ---------- */
const GalleryShowcase = ({ images }: { images: any[] }) => {
  const [active, setActive] = useState<any | null>(null);
  if (!images?.length) return null;

  return (
    <section className="container mx-auto px-4 py-10 sm:py-14">
      <SectionLabel kicker="Capture">Match Gallery</SectionLabel>
      <div
        className="grid gap-3 sm:gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gridAutoFlow: "dense" }}
      >
        {images.map((img, i) => {
          const ratio = img.width && img.height ? img.width / img.height : undefined;
          const isWide = ratio && ratio > 1.4;
          const isTall = ratio && ratio < 0.75;
          return (
            <motion.button
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.4) }}
              whileHover={{ y: -3 }}
              onClick={() => setActive(img)}
              className={`relative group sports-glass sports-glow-hover rounded-2xl overflow-hidden block ${isWide ? "sm:col-span-2" : ""} ${isTall ? "sm:row-span-2" : ""}`}
              style={{ aspectRatio: ratio ? String(ratio) : "1 / 1" }}
            >
              <img
                src={img.url}
                alt={img.alt_text || img.caption || "Match photo"}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 drop-shadow">{img.caption}</p>
                </div>
              )}
              {img.is_pinned && (
                <span className="absolute top-2 left-2 sports-accent-bg text-[9px] font-black uppercase tracking-widest rounded-full px-2 py-0.5">★</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <img src={active.url} alt={active.caption || ""} className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl" />
            {active.caption && <p className="text-center text-white mt-3 font-medium">{active.caption}</p>}
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Sports;
