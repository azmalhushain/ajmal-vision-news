import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Mail, TrendingUp, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { RealtimeStats } from "@/components/admin/RealtimeStats";

const Overview = () => {
  const [subscriberTrend, setSubscriberTrend] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  const chartData = [
    { name: "Jan", views: 4000 },
    { name: "Feb", views: 3000 },
    { name: "Mar", views: 5000 },
    { name: "Apr", views: 4500 },
    { name: "May", views: 6000 },
    { name: "Jun", views: 5500 },
  ];

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setUserEmail(user.email.split("@")[0]);

        const { data: posts } = await supabase.from("posts").select("views, category");

        const categoryCount: Record<string, number> = {};
        posts?.forEach((post) => {
          const cat = post.category || "Uncategorized";
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        setCategoryData(Object.entries(categoryCount).map(([name, value]) => ({ name, value })));

        const { data: subscribers } = await supabase
          .from("newsletter_subscribers")
          .select("subscribed_at")
          .gte("subscribed_at", subDays(new Date(), 7).toISOString());

        const trendData: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const date = format(subDays(new Date(), i), "MMM dd");
          trendData[date] = 0;
        }

        subscribers?.forEach((sub) => {
          const date = format(new Date(sub.subscribed_at), "MMM dd");
          if (trendData[date] !== undefined) {
            trendData[date]++;
          }
        });

        setSubscriberTrend(Object.entries(trendData).map(([date, count]) => ({ date, subscribers: count })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { label: "New Post", path: "/admin/posts", gradient: "from-blue-500 to-indigo-600" },
    { label: "Send Email", path: "/admin/email-marketing", gradient: "from-orange-500 to-pink-600" },
    { label: "View Analytics", path: "/admin/analytics", gradient: "from-emerald-500 to-teal-600" },
    { label: "Manage Users", path: "/admin/users", gradient: "from-violet-500 to-purple-600" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-muted/40 animate-pulse rounded-3xl" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/40 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "hsl(var(--popover) / 0.95)",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* HERO WELCOME BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_60%)]" />
        <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-bold uppercase tracking-widest"
            >
              <Sparkles className="h-3 w-3" />
              Admin Control Centre
            </motion.div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {greeting}{userEmail ? `, ${userEmail}` : ""}!
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-lg">
              Here's a live snapshot of your platform. Everything is running smoothly — let's make today count.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {quickActions.map((a, i) => (
                <motion.div
                  key={a.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <Link
                    to={a.path}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all"
                  >
                    {a.label}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decorative animated rings */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="hidden sm:flex items-center justify-center relative shrink-0"
          >
            <div className="relative w-32 h-32 lg:w-40 lg:h-40">
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse" style={{ animationDuration: "3s" }} />
              <div className="absolute inset-3 rounded-full border-2 border-white/20 animate-pulse" style={{ animationDuration: "4s" }} />
              <div className="absolute inset-6 rounded-full border-2 border-white/15 animate-pulse" style={{ animationDuration: "5s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl">
                  <Zap className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <RealtimeStats />

      {/* CHARTS GRID */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="glass-card rounded-2xl p-5 sm:p-6 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">Subscriber Growth</h3>
                </div>
                <p className="text-xs text-muted-foreground ml-11">Last 7 days</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Live
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subscriberTrend}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.06)" }} />
                <Bar dataKey="subscribers" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="glass-card rounded-2xl p-5 sm:p-6 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">Content by Category</h3>
                </div>
                <p className="text-xs text-muted-foreground ml-11">Post distribution</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* VIEWS + ACTIVITY */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 relative"
        >
          <div className="glass-card rounded-2xl p-5 sm:p-6 overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">Views Trend</h3>
                </div>
                <p className="text-xs text-muted-foreground ml-11">Performance over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3" }} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  );
};

export default Overview;
