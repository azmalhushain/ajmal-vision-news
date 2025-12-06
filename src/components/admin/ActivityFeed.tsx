import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Mail, FileText, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "comment" | "subscriber" | "post" | "user";
  title: string;
  description: string;
  timestamp: string;
  icon: typeof MessageSquare;
  color: string;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Set up real-time subscriptions
    const commentsChannel = supabase
      .channel("activity-comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments" },
        (payload) => {
          const newComment = payload.new as any;
          addActivity({
            id: `comment-${newComment.id}`,
            type: "comment",
            title: "New Comment",
            description: `${newComment.author_name} left a comment`,
            timestamp: newComment.created_at,
            icon: MessageSquare,
            color: "text-pink-500 bg-pink-500/10",
          });
        }
      )
      .subscribe();

    const subscribersChannel = supabase
      .channel("activity-subscribers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "newsletter_subscribers" },
        (payload) => {
          const newSub = payload.new as any;
          addActivity({
            id: `sub-${newSub.id}`,
            type: "subscriber",
            title: "New Subscriber",
            description: `${newSub.email} subscribed to newsletter`,
            timestamp: newSub.subscribed_at,
            icon: Mail,
            color: "text-blue-500 bg-blue-500/10",
          });
        }
      )
      .subscribe();

    const postsChannel = supabase
      .channel("activity-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const newPost = payload.new as any;
          addActivity({
            id: `post-${newPost.id}`,
            type: "post",
            title: "New Post",
            description: `"${newPost.title}" was created`,
            timestamp: newPost.created_at,
            icon: FileText,
            color: "text-orange-500 bg-orange-500/10",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(subscribersChannel);
      supabase.removeChannel(postsChannel);
    };
  }, []);

  const addActivity = (activity: ActivityItem) => {
    setActivities((prev) => [activity, ...prev].slice(0, 20));
  };

  const fetchActivities = async () => {
    try {
      const [commentsRes, subscribersRes, postsRes] = await Promise.all([
        supabase
          .from("post_comments")
          .select("id, author_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("newsletter_subscribers")
          .select("id, email, subscribed_at")
          .order("subscribed_at", { ascending: false })
          .limit(5),
        supabase
          .from("posts")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const allActivities: ActivityItem[] = [];

      commentsRes.data?.forEach((comment) => {
        allActivities.push({
          id: `comment-${comment.id}`,
          type: "comment",
          title: "Comment",
          description: `${comment.author_name} left a comment`,
          timestamp: comment.created_at,
          icon: MessageSquare,
          color: "text-pink-500 bg-pink-500/10",
        });
      });

      subscribersRes.data?.forEach((sub) => {
        allActivities.push({
          id: `sub-${sub.id}`,
          type: "subscriber",
          title: "Subscriber",
          description: `${sub.email} subscribed`,
          timestamp: sub.subscribed_at,
          icon: Mail,
          color: "text-blue-500 bg-blue-500/10",
        });
      });

      postsRes.data?.forEach((post) => {
        allActivities.push({
          id: `post-${post.id}`,
          type: "post",
          title: "Post",
          description: `"${post.title}" created`,
          timestamp: post.created_at,
          icon: FileText,
          color: "text-orange-500 bg-orange-500/10",
        });
      });

      // Sort by timestamp
      allActivities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 15));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
