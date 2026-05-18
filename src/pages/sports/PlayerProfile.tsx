import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButtons } from "@/components/ShareButtons";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Trophy, Globe2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

const db: any = supabase;

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-center">
    <div className="text-2xl font-bold text-[hsl(var(--sports-accent,80_95%_60%))]">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-white/60 mt-1">{label}</div>
  </div>
);

export default function PlayerProfile() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [player, setPlayer] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: p } = await db.from("players").select("*").eq("slug", slug).maybeSingle();
    setPlayer(p);
    if (p?.team_id) {
      const { data: t } = await db.from("teams").select("*").eq("id", p.team_id).maybeSingle();
      setTeam(t);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [slug]);

  const generateBio = async () => {
    if (!player) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("sports-ai", {
        body: { action: "player-bio", payload: { playerId: player.id } },
      });
      if (error) throw error;
      setPlayer({ ...player, bio: data?.bio });
      toast({ title: "Bio generated" });
    } catch (e: any) {
      toast({ title: "AI error", description: e.message, variant: "destructive" });
    } finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="sports-theme min-h-screen bg-[hsl(var(--sports-bg))] pt-24 px-4">
      <Skeleton className="h-64 w-full max-w-4xl mx-auto" />
    </div>
  );
  if (!player) return (
    <div className="sports-theme min-h-screen bg-[hsl(var(--sports-bg))] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-2xl font-bold mb-3">Player not found</p>
        <Link to="/sports"><Button variant="outline">Back to Sports</Button></Link>
      </div>
    </div>
  );

  const primary = team?.color_primary || "#222";
  const stats = (player.stats as any) || {};

  return (
    <PageTransition>
      <SEOHead
        title={`${player.name} — Player Profile`}
        description={player.bio?.slice(0, 150) || `${player.name}, ${player.role}${team ? ` for ${team.name}` : ""}`}
        image={player.photo_url || team?.logo_url}
      />
      <div className="sports-theme min-h-screen bg-[hsl(var(--sports-bg))] text-white">
        {/* Hero */}
        <div
          className="relative pt-24 pb-12 px-4 overflow-hidden"
          style={{ background: `radial-gradient(900px 400px at 70% 0%, ${primary}55, transparent 70%)` }}
        >
          <div className="max-w-5xl mx-auto">
            <Link to={team ? `/sports/team/${team.slug}` : "/sports"} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6">
              <ArrowLeft className="h-4 w-4" /> {team ? team.name : "Sports"}
            </Link>

            <div className="grid md:grid-cols-[260px_1fr] gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-3xl overflow-hidden border-4"
                style={{ borderColor: primary, background: `linear-gradient(135deg, ${primary}33, ${primary}11)` }}
              >
                {player.photo_url ? (
                  <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl font-black opacity-30">
                    {player.jersey_number ?? player.name?.[0]}
                  </div>
                )}
                {player.jersey_number && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur rounded-full w-12 h-12 flex items-center justify-center text-xl font-black">
                    {player.jersey_number}
                  </div>
                )}
              </motion.div>

              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {player.is_captain && <Badge className="bg-amber-500 text-black"><Trophy className="h-3 w-3 mr-1" /> Captain</Badge>}
                  {player.is_overseas && <Badge variant="outline" className="border-white/30 text-white"><Globe2 className="h-3 w-3 mr-1" /> Overseas</Badge>}
                  <Badge variant="outline" className="border-white/30 text-white capitalize">{player.role}</Badge>
                </div>
                <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight">{player.name}</h1>
                {team && (
                  <Link to={`/sports/team/${team.slug}`} className="inline-flex items-center gap-2 mt-3 text-white/80 hover:text-white">
                    {team.logo_url && <img src={team.logo_url} alt="" className="w-6 h-6 rounded-full" />}
                    <span className="font-medium">{team.name}</span>
                  </Link>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-xl">
                  <StatTile label="Matches" value={stats.matches ?? "—"} />
                  <StatTile label="Runs" value={stats.runs ?? "—"} />
                  <StatTile label="Wickets" value={stats.wickets ?? "—"} />
                  <StatTile label="Avg" value={stats.average ?? "—"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="max-w-5xl mx-auto px-4 pb-16 space-y-8">
          <Card className="bg-white/[0.03] border-white/10 p-6 text-white">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold">About</h2>
              <Button size="sm" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10" onClick={generateBio} disabled={generating}>
                <Sparkles className="h-4 w-4 mr-1" /> {generating ? "Generating…" : "AI Bio"}
              </Button>
            </div>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {player.bio || "No bio yet. Tap AI Bio to generate one."}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
              {player.batting_style && <div><span className="text-white/50">Batting:</span> {player.batting_style}</div>}
              {player.bowling_style && <div><span className="text-white/50">Bowling:</span> {player.bowling_style}</div>}
              {player.dob && <div><span className="text-white/50">DOB:</span> {new Date(player.dob).toLocaleDateString()}</div>}
            </div>
          </Card>

          <div className="flex justify-center">
            <ShareButtons url={typeof window !== "undefined" ? window.location.href : ""} title={`${player.name} — Player Profile`} />
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
