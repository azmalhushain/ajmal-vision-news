import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Pencil, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type AuditEntry = Tables<"admin_audit_logs">;

const sectionLabels: Record<string, string> = {
  posts: "Posts & news", gallery_images: "Gallery", podcasts: "Podcasts",
  hero_content: "Hero section", vision_content: "Vision section", development_areas: "Development areas",
  about_content: "About page", contact_content: "Contact page", footer_content: "Footer",
  teams: "Sports teams", players: "Players", matches: "Matches", tournaments: "Tournaments",
  sports_media: "Sports media", match_innings: "Match innings", match_events: "Match events",
  points_overrides: "Points table", sports_news: "Sports news",
};

const actionLabels: Record<AuditEntry["action"], string> = {
  INSERT: "created", UPDATE: "updated", DELETE: "removed",
};

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (active) {
        if (error) console.error("Could not load admin change history:", error);
        setActivities(data || []);
        setLoading(false);
      }
    };
    void load();
    const channel = supabase
      .channel("admin-content-change-history")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_audit_logs" }, () => {
        void load();
      })
      .subscribe();
    const refresh = window.setInterval(() => void load(), 30000);
    return () => {
      active = false;
      window.clearInterval(refresh);
      void supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content change history</CardTitle>
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
          <History className="h-5 w-5 text-primary" />
          Content change history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No content changes yet
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activity.action === "INSERT" ? Plus : activity.action === "DELETE" ? Trash2 : Pencil;
                const changed = activity.changed_fields.filter((field) => !["created_at", "updated_at"].includes(field));
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.actor_name} {actionLabels[activity.action]} {sectionLabels[activity.table_name] || activity.table_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.item_label}{changed.length ? ` · ${changed.slice(0, 4).join(", ")}${changed.length > 4 ? ` +${changed.length - 4}` : ""}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                        })}
                        <span className="mx-1">·</span>
                        {new Date(activity.created_at).toLocaleString()}
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
