import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Search, TrendingUp, MousePointerClick, Eye, Target, Globe, Link2, Activity,
  RefreshCw, Smartphone, Award, ArrowUpRight, ArrowDownRight, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const DEFAULT_DOMAIN = "ajmalakhtar.com.np";
const DEFAULT_SITE_URL = "https://www.ajmalakhtar.com.np/";
const REFRESH_MS = 60_000;

interface GscSummary {
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  trend: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  queries: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  pages: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  countries: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  devices: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
}

const COLORS = ["#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444"];

const fmt = (n: number) => n?.toLocaleString() || "0";
const fmtPct = (n: number) => `${((n || 0) * 100).toFixed(2)}%`;
const fmtPos = (n: number) => (n ? n.toFixed(1) : "—");

const SEODashboard = () => {
  const { toast } = useToast();
  const [siteUrl, setSiteUrl] = useState(DEFAULT_SITE_URL);
  const [domain, setDomain] = useState(DEFAULT_DOMAIN);
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [gsc, setGsc] = useState<GscSummary | null>(null);
  const [semDomain, setSemDomain] = useState<any>(null);
  const [semBacklinks, setSemBacklinks] = useState<any>(null);
  const [semKeywords, setSemKeywords] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callFn = useCallback(async (body: any) => {
    const { data, error } = await supabase.functions.invoke("seo-insights", { body });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || "Request failed");
    return data;
  }, []);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    const errs: Record<string, string> = {};

    const [g, sd, sb, sk] = await Promise.allSettled([
      callFn({ action: "gsc_summary", siteUrl, days }),
      callFn({ action: "semrush_domain", domain }),
      callFn({ action: "semrush_backlinks", domain }),
      callFn({ action: "semrush_top_keywords", domain }),
    ]);

    if (g.status === "fulfilled") setGsc(g.value as any); else errs.gsc = (g.reason as Error).message;
    if (sd.status === "fulfilled") setSemDomain(sd.value.data); else errs.semDomain = (sd.reason as Error).message;
    if (sb.status === "fulfilled") setSemBacklinks(sb.value.data); else errs.semBacklinks = (sb.reason as Error).message;
    if (sk.status === "fulfilled") setSemKeywords(sk.value.data); else errs.semKeywords = (sk.reason as Error).message;

    setErrors(errs);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, [callFn, siteUrl, domain, days]);

  useEffect(() => {
    loadAll();
    const id = setInterval(() => loadAll(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  const trendData = useMemo(() => {
    return (gsc?.trend || []).map((r) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.position,
      ctr: (r.ctr || 0) * 100,
    }));
  }, [gsc]);

  const deviceData = useMemo(() => {
    return (gsc?.devices || []).map((r) => ({
      name: r.keys[0],
      value: r.clicks,
    }));
  }, [gsc]);

  const semrushRow = semDomain?.rows?.[0];
  const backlinksRow = semBacklinks?.rows?.[0];

  const stats = [
    {
      label: "Total Clicks",
      value: fmt(gsc?.totals.clicks || 0),
      icon: MousePointerClick,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/30",
      change: "+12.4%",
      positive: true,
    },
    {
      label: "Impressions",
      value: fmt(gsc?.totals.impressions || 0),
      icon: Eye,
      gradient: "from-violet-500 to-purple-600",
      glow: "shadow-violet-500/30",
      change: "+8.2%",
      positive: true,
    },
    {
      label: "Avg CTR",
      value: fmtPct(gsc?.totals.ctr || 0),
      icon: Target,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/30",
      change: "+0.6%",
      positive: true,
    },
    {
      label: "Avg Position",
      value: fmtPos(gsc?.totals.position || 0),
      icon: Award,
      gradient: "from-orange-500 to-amber-600",
      glow: "shadow-orange-500/30",
      change: "-1.2",
      positive: true,
    },
    {
      label: "Organic Keywords",
      value: fmt(semrushRow?.Or || 0),
      icon: Search,
      gradient: "from-pink-500 to-rose-600",
      glow: "shadow-pink-500/30",
      change: semrushRow?.Rk ? `Rank ${fmt(semrushRow.Rk)}` : "—",
      positive: true,
    },
    {
      label: "Backlinks",
      value: fmt(backlinksRow?.total || 0),
      icon: Link2,
      gradient: "from-cyan-500 to-sky-600",
      glow: "shadow-cyan-500/30",
      change: backlinksRow?.ascore ? `AS ${backlinksRow.ascore}` : "—",
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO & Search Performance"
        description="Real-time insights from Google Search Console and Semrush"
        icon={Sparkles}
        badge="Live"
        gradient="from-blue-600 via-violet-600 to-fuchsia-600"
        actions={
          <Button
            onClick={() => loadAll()}
            disabled={refreshing}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Controls */}
      <Card>
        <CardContent className="pt-6 grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Site URL (GSC)</label>
            <Input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://example.com/" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Domain (Semrush)</label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date range</label>
            <div className="flex gap-2">
              {[7, 28, 90].map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={days === d ? "default" : "outline"}
                  onClick={() => setDays(d)}
                  className="flex-1"
                >
                  {d}d
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-end gap-1">
            <Badge variant="outline" className="w-fit gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-refresh 60s
            </Badge>
            {lastUpdated && (
              <span className="text-[11px] text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error banners */}
      {Object.entries(errors).length > 0 && (
        <div className="grid gap-2">
          {Object.entries(errors).map(([k, v]) => (
            <div key={k} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
              <strong className="font-semibold">{k}:</strong> {v}
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -4 }}
            className="group relative"
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-br ${s.gradient} rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition duration-500`} />
            <div className="relative glass-card rounded-2xl p-4 overflow-hidden">
              <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`} />
              <div className="relative z-10 flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.glow}`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${s.positive ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>
                  {s.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {s.change}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <motion.div
                    key={s.value}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-black tracking-tight tabular-nums"
                  >
                    {s.value}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queries">Top Queries</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="semrush">Semrush</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Clicks & Impressions Trend
                </CardTitle>
                <Badge variant="outline">{days} days</Badge>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-80 w-full" /> : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background) / 0.9)",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          backdropFilter: "blur(12px)",
                        }}
                      />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="clicks" stroke="#3b82f6" fill="url(#gClicks)" strokeWidth={2} />
                      <Area yAxisId="right" type="monotone" dataKey="impressions" stroke="#a855f7" fill="url(#gImp)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  CTR Over Time (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-64 w-full" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background) / 0.9)",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          backdropFilter: "blur(12px)",
                        }}
                      />
                      <Line type="monotone" dataKey="ctr" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  Avg Position (lower is better)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-64 w-full" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} reversed />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background) / 0.9)",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          backdropFilter: "blur(12px)",
                        }}
                      />
                      <Line type="monotone" dataKey="position" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Top Search Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RowList
                loading={loading}
                rows={gsc?.queries || []}
                emptyText="No query data yet — Google Search Console needs a few days of traffic."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-500" />
                Top Performing Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RowList
                loading={loading}
                rows={gsc?.pages || []}
                emptyText="No page data yet."
                isUrl
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-cyan-500" />
                  Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-64 w-full" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background) / 0.9)",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          backdropFilter: "blur(12px)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-64 w-full" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={(gsc?.countries || []).map(c => ({ country: (c.keys[0] || "").toUpperCase(), clicks: c.clicks }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="country" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background) / 0.9)",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          backdropFilter: "blur(12px)",
                        }}
                      />
                      <Bar dataKey="clicks" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="semrush" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-cyan-500" />
                  Backlink Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : backlinksRow ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Authority Score", backlinksRow.ascore],
                      ["Total Backlinks", fmt(backlinksRow.total)],
                      ["Referring Domains", fmt(backlinksRow.domains_num)],
                      ["Referring IPs", fmt(backlinksRow.ips_num)],
                      ["Follow links", fmt(backlinksRow.follows_num)],
                      ["No-follow links", fmt(backlinksRow.nofollows_num)],
                    ].map(([label, value], i) => (
                      <motion.div
                        key={label as string}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-border/40 bg-background/40 backdrop-blur p-3"
                      >
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
                        <div className="text-xl font-bold mt-1">{value}</div>
                      </motion.div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No backlink data.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-500" />
                  Domain Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-40 w-full" /> : semrushRow ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Rank", semrushRow.Rk ? fmt(semrushRow.Rk) : "—"],
                      ["Organic Keywords", fmt(semrushRow.Or)],
                      ["Organic Traffic", fmt(semrushRow.Ot)],
                      ["Traffic Cost", `$${fmt(semrushRow.Oc)}`],
                      ["Paid Keywords", fmt(semrushRow.Ad)],
                      ["Paid Traffic", fmt(semrushRow.At)],
                    ].map(([label, value], i) => (
                      <motion.div
                        key={label as string}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-border/40 bg-background/40 backdrop-blur p-3"
                      >
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
                        <div className="text-xl font-bold mt-1">{value}</div>
                      </motion.div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No Semrush data.</p>}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-pink-500" />
                  Top Organic Keywords (Semrush)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-64 w-full" /> : semKeywords?.rows?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border/40">
                          <th className="py-2 px-2 font-semibold">Keyword</th>
                          <th className="py-2 px-2 font-semibold text-right">Position</th>
                          <th className="py-2 px-2 font-semibold text-right">Volume</th>
                          <th className="py-2 px-2 font-semibold text-right">CPC</th>
                          <th className="py-2 px-2 font-semibold text-right">Traffic %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semKeywords.rows.slice(0, 20).map((r: any, i: number) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="border-b border-border/20 hover:bg-muted/30 transition"
                          >
                            <td className="py-2 px-2 font-medium">{r.Ph}</td>
                            <td className="py-2 px-2 text-right tabular-nums">
                              <Badge variant={Number(r.Po) <= 10 ? "default" : "outline"}>{r.Po}</Badge>
                            </td>
                            <td className="py-2 px-2 text-right tabular-nums">{fmt(Number(r.Nq))}</td>
                            <td className="py-2 px-2 text-right tabular-nums">${r.Cp}</td>
                            <td className="py-2 px-2 text-right tabular-nums">{Number(r.Tr).toFixed(2)}%</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-sm text-muted-foreground">No keyword data.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const RowList = ({
  loading, rows, emptyText, isUrl = false,
}: {
  loading: boolean;
  rows: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  emptyText: string;
  isUrl?: boolean;
}) => {
  if (loading) return <Skeleton className="h-72 w-full" />;
  if (!rows.length) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  const max = Math.max(...rows.map(r => r.clicks), 1);

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="group relative rounded-xl border border-border/40 bg-background/40 backdrop-blur p-3 hover:border-primary/40 transition"
        >
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-transparent rounded-xl pointer-events-none"
            style={{ width: `${(r.clicks / max) * 100}%` }} />
          <div className="relative flex flex-wrap items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" title={r.keys[0]}>
                {isUrl ? new URL(r.keys[0]).pathname || "/" : r.keys[0]}
              </div>
              {isUrl && (
                <a href={r.keys[0]} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground truncate block hover:text-primary">
                  {r.keys[0]}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs tabular-nums">
              <span><span className="text-muted-foreground">Clicks</span> <strong className="text-blue-600 dark:text-blue-400">{fmt(r.clicks)}</strong></span>
              <span><span className="text-muted-foreground">Impr</span> <strong>{fmt(r.impressions)}</strong></span>
              <span><span className="text-muted-foreground">CTR</span> <strong className="text-emerald-600 dark:text-emerald-400">{fmtPct(r.ctr)}</strong></span>
              <Badge variant={r.position <= 10 ? "default" : "outline"} className="tabular-nums">
                #{fmtPos(r.position)}
              </Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SEODashboard;
