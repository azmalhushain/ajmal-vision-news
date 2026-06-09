import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Users, Eye, Mail, MessageSquare, Bell, ArrowUpRight } from "lucide-react";

interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalViews: number;
  totalSubscribers: number;
  totalComments: number;
  totalMessages: number;
}

export const RealtimeStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    totalSubscribers: 0,
    totalComments: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  const fetchStats = useCallback(async () => {
    try {
      const [
        { count: postsCount },
        { count: usersCount },
        { count: subscribersCount },
        { count: commentsCount },
        { count: messagesCount },
        { data: posts },
      ] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("post_comments").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("views"),
      ]);

      const totalViews = posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;

      setStats({
        totalPosts: postsCount || 0,
        totalUsers: usersCount || 0,
        totalViews,
        totalSubscribers: subscribersCount || 0,
        totalComments: commentsCount || 0,
        totalMessages: messagesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerAnimation = (cardKey: string) => {
    setAnimatingCards((prev) => new Set([...prev, cardKey]));
    setTimeout(() => {
      setAnimatingCards((prev) => {
        const next = new Set(prev);
        next.delete(cardKey);
        return next;
      });
    }, 1000);
  };

  useEffect(() => {
    fetchStats();

    const channels = [
      supabase.channel("realtime-posts").on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => { triggerAnimation("posts"); fetchStats(); }).subscribe(),
      supabase.channel("realtime-users").on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { triggerAnimation("users"); fetchStats(); }).subscribe(),
      supabase.channel("realtime-subscribers").on("postgres_changes", { event: "*", schema: "public", table: "newsletter_subscribers" }, () => { triggerAnimation("subscribers"); fetchStats(); }).subscribe(),
      supabase.channel("realtime-comments").on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => { triggerAnimation("comments"); fetchStats(); }).subscribe(),
      supabase.channel("realtime-messages").on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => { triggerAnimation("messages"); fetchStats(); }).subscribe(),
    ];

    return () => { channels.forEach((c) => supabase.removeChannel(c)); };
  }, [fetchStats]);

  const statCards = [
    { key: "posts", title: "Total Posts", value: stats.totalPosts, icon: FileText, gradient: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/30" },
    { key: "users", title: "Total Users", value: stats.totalUsers, icon: Users, gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30" },
    { key: "views", title: "Total Views", value: stats.totalViews, icon: Eye, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30" },
    { key: "subscribers", title: "Subscribers", value: stats.totalSubscribers, icon: Mail, gradient: "from-orange-500 to-amber-600", glow: "shadow-orange-500/30" },
    { key: "comments", title: "Comments", value: stats.totalComments, icon: MessageSquare, gradient: "from-pink-500 to-rose-600", glow: "shadow-pink-500/30" },
    { key: "messages", title: "Messages", value: stats.totalMessages, icon: Bell, gradient: "from-cyan-500 to-sky-600", glow: "shadow-cyan-500/30" },
  ];

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-muted/40 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => {
        const isPulsing = animatingCards.has(stat.key);
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative"
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition duration-500`} />
            <div className={`relative glass-card rounded-2xl p-4 overflow-hidden ${isPulsing ? "ring-2 ring-primary" : ""}`}>
              {/* gradient overlay */}
              <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`} />

              <AnimatePresence>
                {isPulsing && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.4 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-full z-0`}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:rotate-12 transition-all" />
              </div>

              <div className="relative z-10">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{stat.title}</p>
                <motion.div
                  key={stat.value}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-black tracking-tight text-foreground tabular-nums"
                >
                  {stat.value.toLocaleString()}
                </motion.div>
                {isPulsing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-primary font-bold mt-1 flex items-center gap-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    LIVE UPDATE
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
