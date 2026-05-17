import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, Calendar, Users, Trophy, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const db: any = supabase;

const getSessionId = () => {
  if (typeof window === "undefined") return "";
  let s = localStorage.getItem("anon_session_id");
  if (!s) { s = crypto.randomUUID(); localStorage.setItem("anon_session_id", s); }
  return s;
};

export default function TeamPage() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [teamMap, setTeamMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(false);

  const sessionId = useMemo(getSessionId, []);

  const load = async () => {
    setLoading(true);
    const { data: t } = await db.from("teams").select("*").eq("slug", slug).maybeSingle();
    if (!t) { setTeam(null); setLoading(false); return; }
    setTeam(t);

    const [{ data: p }, { data: m }, { data: all }, { count }] = await Promise.all([
      db.from("players").select("*").eq("team_id", t.id).eq("is_active", true).order("jersey_number"),
      db.from("matches").select("*").or(`team_a_id.eq.${t.id},team_b_id.eq.${t.id}`).order("scheduled_at"),
      db.from("teams").select("id,name,short_name,color_primary,logo_url,slug").eq("tournament_id", t.tournament_id),
      db.from("team_followers").select("id", { count: "exact", head: true }).eq("team_id", t.id),
    ]);
    setPlayers(p || []);
    setMatches(m || []);
    setTeamMap(Object.fromEntries((all || []).map((x: any) => [x.id, x])));
    setFollowers(count || 0);

    // Am I following?
    const { data: { user } } = await supabase.auth.getUser();
    let q = db.from("team_followers").select("id").eq("team_id", t.id);
    q = user ? q.eq("user_id", user.id) : q.eq("session_id", sessionId);
    const { data: mine } = await q.maybeSingle();
    setFollowing(!!mine);

    setLoading(false);
  };
  useEffect(() => { load(); }, [slug]);

  const toggleFollow = async () => {
    if (!team) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (following) {
      let q = db.from("team_followers").delete().eq("team_id", team.id);
      q = user ? q.eq("user_id", user.id) : q.eq("session_id", sessionId);
      const { error } = await q;
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setFollowing(false); setFollowers(f => Math.max(0, f - 1));
    } else {
      const row = user
        ? { team_id: team.id, user_id: user.id }
        : { team_id: team.id, session_id: sessionId };
      const { error } = await db.from("team_followers").insert(row);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setFollowing(true); setFollowers(f => f + 1);
      toast({ title: `Following ${team.name}` });
    }
  };

  if (loading) return (
    <div className="sports-theme min-h-screen bg-[hsl(var(--sports-bg))] pt-24 px-4">
      <Skeleton className="h-72 w-full max-w-5xl mx-auto" />
    </div>
  );
  if (!team) return (
    <div className="sports-theme min-h-screen bg-[hsl(var(--sports-bg))] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-2xl font-bold mb-3">Team not found</p>
        <Link to="/sports"><Button variant="outline">Back to Sports</Button></Link>
      </div>
    </div>
  );

  const primary = team.color_primary || "#222";
  const captain = players.find(p => p.is_captain);
  const upcoming = matches.filter(m => m.status === "scheduled");
  const results = matches.filter(m => m.status === "completed");

  return (
    <PageTransition>
      <SEOHead
        title={`${team.name} — Squad, Fixtures, Results`}
        description={team.description?.slice(0, 150) || `Follow ${team.name}: full squad, upcoming fixtures and recent results.`}
        image={team.logo_url}
      />
      <div className="sports-theme min-h-screen bg-[hsl(var(--sports-bg))] text-white">
        {/* Hero */}
        <div
          className="relative pt-24 pb-10 px-4 overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${primary}66, transparent 80%), radial-gradient(800px 400px at 20% 0%, ${primary}55, transparent 70%)` }}
        >
          <div className="max-w-5xl mx-auto">
            <Link to="/sports" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6">
              <ArrowLeft className="h-4 w-4" /> Sports
            </Link>
            <div className="flex flex-wrap items-center gap-6">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-28 h-28 rounded-full bg-white/10 border-4 flex items-center justify-center text-3xl font-black backdrop-blur"
                style={{ borderColor: primary }}>
                {team.logo_url
                  ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-full" />
                  : team.short_name || team.name?.[0]}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{team.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-white/80 text-sm">
                  {team.home_ground && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {team.home_ground}</span>}
                  {team.founded_year && <span>Est. {team.founded_year}</span>}
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {players.length} players</span>
                  <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {followers} fans</span>
                </div>
              </div>
              <Button
                onClick={toggleFollow}
                size="lg"
                className={following
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  : "bg-[hsl(var(--sports-accent,80_95%_60%))] text-black hover:opacity-90"}
              >
                <Heart className={`h-4 w-4 mr-2 ${following ? "fill-current" : ""}`} />
                {following ? "Following" : "Follow"}
              </Button>
            </div>
            {team.description && <p className="text-white/70 mt-5 max-w-3xl">{team.description}</p>}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-16">
          <Tabs defaultValue="squad">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="squad">Squad ({players.length})</TabsTrigger>
              <TabsTrigger value="fixtures">Fixtures ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="squad" className="mt-6">
              {captain && (
                <Card className="bg-white/[0.03] border-white/10 p-5 mb-5 flex items-center gap-4">
                  <Crown className="h-6 w-6 text-amber-400" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-white/60">Captain</p>
                    <Link to={`/sports/player/${captain.slug}`} className="text-xl font-bold hover:underline">{captain.name}</Link>
                  </div>
                  {captain.photo_url && <img src={captain.photo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: primary }} />}
                </Card>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map(p => (
                  <Link
                    key={p.id} to={`/sports/player/${p.slug}`}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3 hover:border-[hsl(var(--sports-accent,80_95%_60%))]/60 hover:bg-white/[0.06] transition"
                  >
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: primary }} />
                      : <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg" style={{ background: primary }}>{p.jersey_number ?? p.name?.[0]}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate group-hover:text-[hsl(var(--sports-accent,80_95%_60%))]">{p.name}</p>
                      <p className="text-xs text-white/60 capitalize truncate">{p.role}{p.is_overseas ? " · Overseas" : ""}</p>
                    </div>
                    {p.is_captain && <Badge className="bg-amber-500 text-black text-[10px]">C</Badge>}
                  </Link>
                ))}
                {!players.length && <p className="text-white/60 text-center py-12 col-span-full">No squad players yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="fixtures" className="mt-6 space-y-3">
              {upcoming.map(m => (
                <Link key={m.id} to={`/sports/match/${m.id}`} className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="outline" className="border-white/20 text-white">M{m.match_no}</Badge>
                    <span className="text-sm text-white/70">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : "TBD"}</span>
                  </div>
                  <p className="mt-2 font-bold text-lg">
                    {teamMap[m.team_a_id]?.name || "TBA"} <span className="text-white/40 mx-2">vs</span> {teamMap[m.team_b_id]?.name || "TBA"}
                  </p>
                  {m.venue && <p className="text-xs text-white/50 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.venue}</p>}
                </Link>
              ))}
              {!upcoming.length && <p className="text-white/60 text-center py-12">No upcoming fixtures.</p>}
            </TabsContent>

            <TabsContent value="results" className="mt-6 space-y-3">
              {results.map(m => (
                <Link key={m.id} to={`/sports/match/${m.id}`} className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="secondary">M{m.match_no} · Completed</Badge>
                    {m.winner_id === team.id && <Badge className="bg-emerald-500 text-black"><Trophy className="h-3 w-3 mr-1" /> Won</Badge>}
                  </div>
                  <p className="mt-2 font-bold">
                    {teamMap[m.team_a_id]?.name} <span className="text-white/40 mx-2">vs</span> {teamMap[m.team_b_id]?.name}
                  </p>
                  {m.result_text && <p className="text-sm text-white/70 mt-1">{m.result_text}</p>}
                </Link>
              ))}
              {!results.length && <p className="text-white/60 text-center py-12">No completed matches yet.</p>}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
