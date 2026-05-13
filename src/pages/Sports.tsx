import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { LiveMatchBanner } from "@/components/sports/LiveMatchBanner";
import { NextMatchCountdown } from "@/components/sports/NextMatchCountdown";
import { MatchCard } from "@/components/sports/MatchCard";

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
    (async () => {
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
      }
    })();
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

  return (
    <PageTransition>
      <SEOHead
        title="KPL3 Sports Portal — Bhokraha Narsingh"
        description="Live scores, fixtures, teams and standings for the KPL3 cricket tournament hosted by Bhokraha Narsingh Municipality."
        url="/sports"
        keywords="KPL3, cricket, Nepal, Bhokraha Narsingh, sports, fixtures, live score"
      />
      <div className="min-h-screen pt-20 sm:pt-24">
        <header className="container mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent font-bold">Tournament</p>
              <h1 className="text-3xl sm:text-5xl font-black flex items-center gap-3">
                <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-accent" /> {tournament?.name || "Sports"}
              </h1>
              {tournament?.season && <p className="text-sm text-muted-foreground mt-1">Season {tournament.season} · <Badge variant="outline" className="capitalize">{tournament.status}</Badge></p>}
            </div>
            {tournaments.length > 1 && (
              <Select value={tid} onValueChange={setTid}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </header>

        <section className="container mx-auto px-4 py-4 grid gap-4 lg:grid-cols-2">
          <LiveMatchBanner />
          <NextMatchCountdown />
        </section>

        <section className="container mx-auto px-4 py-6">
          <Tabs defaultValue="fixtures">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="fixtures"><Calendar className="h-4 w-4 mr-1.5 hidden sm:inline" />Fixtures</TabsTrigger>
              <TabsTrigger value="teams"><Users className="h-4 w-4 mr-1.5 hidden sm:inline" />Teams</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="news"><Newspaper className="h-4 w-4 mr-1.5 hidden sm:inline" />News</TabsTrigger>
            </TabsList>

            <TabsContent value="fixtures" className="mt-6 space-y-6">
              {live.length > 0 && (
                <div>
                  <h2 className="text-sm uppercase tracking-widest text-destructive font-bold mb-3">Live now</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {live.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />)}
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-3">Upcoming</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {upcoming.length ? upcoming.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />) : <p className="text-sm text-muted-foreground col-span-full">No upcoming matches.</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {teams.map(t => (
                  <div key={t.id} className="glass-card glass-hover rounded-2xl p-5 text-center" style={{ borderTop: `4px solid ${t.color_primary || "hsl(var(--accent))"}` }}>
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden flex items-center justify-center text-white font-black text-xl border-4 border-background shadow-lg" style={{ background: t.color_primary || "#444" }}>
                      {t.logo_url ? <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" /> : (t.short_name || t.name?.[0])}
                    </div>
                    <h3 className="font-bold mt-3 text-sm sm:text-base">{t.name}</h3>
                    {t.home_ground && <p className="text-xs text-muted-foreground mt-1">{t.home_ground}</p>}
                  </div>
                ))}
                {!teams.length && <p className="text-sm text-muted-foreground col-span-full text-center py-8">No teams yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              <div className="grid gap-3 md:grid-cols-2">
                {completed.length ? completed.map(m => <MatchCard key={m.id} match={m} teamA={teamMap[m.team_a_id]} teamB={teamMap[m.team_b_id]} innings={innByMatch[m.id]} />) : <p className="text-sm text-muted-foreground col-span-full">No completed matches yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="news" className="mt-6">
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
                {!news.length && <p className="text-sm text-muted-foreground col-span-full text-center py-8">No sports news yet.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <SocialPosts />
        <Footer />
      </div>
    </PageTransition>
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
