import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, Eye, MessageCircle, TrendingUp, Crown, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Loader2 } from "lucide-react";

interface TopPost {
  id: string;
  title: string;
  views: number;
  likes_count: number;
  category: string;
}

interface UserEngagement {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  likes_given: number;
  comments_made: number;
}

interface EngagementStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViewsPerPost: number;
}

const EngagementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TopPost[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserEngagement[]>([]);
  const [stats, setStats] = useState<EngagementStats>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    avgViewsPerPost: 0,
  });
  const [viewsTrend, setViewsTrend] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch top posts by views
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, views, likes_count, category")
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(10);

      setTopPosts(posts || []);

      // Fetch trending posts (most liked recently)
      const { data: trending } = await supabase
        .from("posts")
        .select("id, title, views, likes_count, category")
        .eq("status", "published")
        .order("likes_count", { ascending: false })
        .limit(5);

      setTrendingPosts(trending || []);

      // Calculate stats
      const { data: allPosts } = await supabase
        .from("posts")
        .select("views, likes_count")
        .eq("status", "published");

      const { count: commentsCount } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true);

      const totalViews = allPosts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      const totalLikes = allPosts?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0;
      const avgViews = allPosts?.length ? Math.round(totalViews / allPosts.length) : 0;

      setStats({
        totalViews,
        totalLikes,
        totalComments: commentsCount || 0,
        avgViewsPerPost: avgViews,
      });

      // Fetch most active users (by comments)
      const { data: comments } = await supabase
        .from("post_comments")
        .select("user_id, author_name")
        .eq("is_approved", true);

      const userCommentCounts: Record<string, { name: string; count: number }> = {};
      comments?.forEach((c) => {
        const key = c.user_id || c.author_name;
        if (!userCommentCounts[key]) {
          userCommentCounts[key] = { name: c.author_name, count: 0 };
        }
        userCommentCounts[key].count++;
      });

      const topCommenters = Object.entries(userCommentCounts)
        .map(([id, data]) => ({
          user_id: id,
          full_name: data.name,
          avatar_url: null,
          likes_given: 0,
          comments_made: data.count,
        }))
        .sort((a, b) => b.comments_made - a.comments_made)
        .slice(0, 10);

      setActiveUsers(topCommenters);

      // Create views trend data
      const viewsData = (posts || []).slice(0, 7).map((p) => ({
        name: p.title.substring(0, 15) + "...",
        views: p.views || 0,
        likes: p.likes_count || 0,
      }));
      setViewsTrend(viewsData);

    } catch (error) {
      console.error("Error fetching engagement data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const maxViews = Math.max(...topPosts.map((p) => p.views || 1), 1);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">User Engagement Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track user activity, popular content, and engagement metrics
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all posts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">User reactions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">User discussions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Views/Post</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgViewsPerPost.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Average engagement</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Popular Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending Content</TabsTrigger>
          <TabsTrigger value="users">Most Active Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top Posts by Views
              </CardTitle>
              <CardDescription>Most viewed content on your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likes_count || 0}
                        </span>
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      </div>
                    </div>
                    <div className="w-32 hidden sm:block">
                      <Progress value={((post.views || 0) / maxViews) * 100} className="h-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Most Liked Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{post.title}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">{post.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-red-500">
                        <Heart className="h-4 w-4 fill-current" />
                        <span className="font-semibold">{post.likes_count || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="likes" fill="hsl(var(--destructive))" name="Likes" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Most Active Commenters
              </CardTitle>
              <CardDescription>Users with the most approved comments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active users yet</p>
                ) : (
                  activeUsers.map((user, index) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {user.comments_made} comments
                          </span>
                        </div>
                      </div>
                      {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Views vs Likes comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={viewsTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="likes" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Views Engagement</span>
                    <span className="text-muted-foreground">{stats.totalViews} total</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Like Rate</span>
                    <span className="text-muted-foreground">
                      {stats.totalViews > 0 
                        ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalViews > 0 ? (stats.totalLikes / stats.totalViews) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Comment Rate</span>
                    <span className="text-muted-foreground">
                      {stats.totalViews > 0 
                        ? ((stats.totalComments / stats.totalViews) * 100).toFixed(2) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalViews > 0 ? Math.min((stats.totalComments / stats.totalViews) * 100, 100) : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EngagementDashboard;