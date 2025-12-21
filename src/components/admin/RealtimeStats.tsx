import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Users, Eye, TrendingUp, Mail, MessageSquare, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    // Set up realtime subscriptions
    const postsChannel = supabase
      .channel("realtime-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        triggerAnimation("posts");
        fetchStats();
      })
      .subscribe();

    const usersChannel = supabase
      .channel("realtime-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        triggerAnimation("users");
        fetchStats();
      })
      .subscribe();

    const subscribersChannel = supabase
      .channel("realtime-subscribers")
      .on("postgres_changes", { event: "*", schema: "public", table: "newsletter_subscribers" }, () => {
        triggerAnimation("subscribers");
        fetchStats();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel("realtime-comments")
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => {
        triggerAnimation("comments");
        fetchStats();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => {
        triggerAnimation("messages");
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(subscribersChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [fetchStats]);

  const statCards = [
    { key: "posts", title: "Total Posts", value: stats.totalPosts, icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { key: "users", title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-green-500", bgColor: "bg-green-500/10" },
    { key: "views", title: "Total Views", value: stats.totalViews, icon: Eye, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { key: "subscribers", title: "Subscribers", value: stats.totalSubscribers, icon: Mail, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { key: "comments", title: "Comments", value: stats.totalComments, icon: MessageSquare, color: "text-pink-500", bgColor: "bg-pink-500/10" },
    { key: "messages", title: "Messages", value: stats.totalMessages, icon: Bell, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={`hover:shadow-md transition-all duration-300 relative overflow-hidden ${
              animatingCards.has(stat.key) ? "ring-2 ring-primary" : ""
            }`}
          >
            <AnimatePresence>
              {animatingCards.has(stat.key) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-primary rounded-full z-0"
                  style={{ transformOrigin: "center" }}
                />
              )}
            </AnimatePresence>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <motion.div
                key={stat.value}
                initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold"
              >
                {stat.value.toLocaleString()}
              </motion.div>
              {animatingCards.has(stat.key) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-primary font-medium mt-1"
                >
                  Updated!
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
