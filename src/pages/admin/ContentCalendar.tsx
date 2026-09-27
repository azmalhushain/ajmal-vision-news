import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, FileText, Image as ImageIcon,
  Mic, ExternalLink, Clock,
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, addDays, isSameMonth, isSameDay, isToday, parseISO,
} from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ContentType = "post" | "podcast" | "gallery";

interface CalendarItem {
  id: string;
  type: ContentType;
  title: string;
  date: Date;
  status: string;
  editorPath: string;
}

const TYPE_META: Record<ContentType, { label: string; icon: typeof FileText; chip: string; dot: string }> = {
  post: { label: "Post", icon: FileText, chip: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30", dot: "bg-blue-500" },
  podcast: { label: "Podcast", icon: Mic, chip: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30", dot: "bg-purple-500" },
  gallery: { label: "Gallery", icon: ImageIcon, chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30", dot: "bg-emerald-500" },
};

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  scheduled: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
  archived: "bg-muted text-muted-foreground border-border",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ContentCalendar = () => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const rangeStart = startOfWeek(startOfMonth(month));
  const rangeEnd = endOfWeek(endOfMonth(month));

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["content-calendar", format(month, "yyyy-MM")],
    queryFn: async () => {
      const from = rangeStart.toISOString();
      const to = rangeEnd.toISOString();

      const [postsRes, podcastsRes, galleryRes] = await Promise.all([
        supabase
          .from("posts")
          .select("id, title, status, created_at, published_at, scheduled_publish_at")
          .or(`scheduled_publish_at.gte.${from},published_at.gte.${from},created_at.gte.${from}`)
          .or(`scheduled_publish_at.lte.${to},published_at.lte.${to},created_at.lte.${to}`),
        supabase
          .from("podcasts")
          .select("id, title, status, created_at, scheduled_publish_at")
          .or(`scheduled_publish_at.gte.${from},created_at.gte.${from}`)
          .or(`scheduled_publish_at.lte.${to},created_at.lte.${to}`),
        supabase
          .from("gallery_images")
          .select("id, title, status, created_at, scheduled_publish_at")
          .or(`scheduled_publish_at.gte.${from},created_at.gte.${from}`)
          .or(`scheduled_publish_at.lte.${to},created_at.lte.${to}`),
      ]);

      const out: CalendarItem[] = [];

      for (const p of postsRes.data ?? []) {
        const raw = p.scheduled_publish_at || p.published_at || p.created_at;
        if (!raw) continue;
        out.push({
          id: p.id, type: "post", title: p.title || "Untitled post",
          date: parseISO(raw), status: p.status || "draft",
          editorPath: "/admin/posts",
        });
      }
      for (const p of podcastsRes.data ?? []) {
        const raw = p.scheduled_publish_at || p.created_at;
        if (!raw) continue;
        out.push({
          id: p.id, type: "podcast", title: p.title || "Untitled episode",
          date: parseISO(raw), status: p.status || "published",
          editorPath: "/admin/podcasts",
        });
      }
      for (const g of galleryRes.data ?? []) {
        const raw = g.scheduled_publish_at || g.created_at;
        if (!raw) continue;
        out.push({
          id: g.id, type: "gallery", title: g.title || "Gallery image",
          date: parseISO(raw), status: g.status || "published",
          editorPath: "/admin/gallery",
        });
      }
      return out;
    },
  });

  const filtered = useMemo(
    () => (typeFilter === "all" ? items : items.filter((i) => i.type === typeFilter)),
    [items, typeFilter],
  );

  const days = useMemo(() => {
    const list: Date[] = [];
    let d = rangeStart;
    while (d <= rangeEnd) {
      list.push(d);
      d = addDays(d, 1);
    }
    return list;
  }, [format(month, "yyyy-MM")]); // eslint-disable-line react-hooks/exhaustive-deps

  const itemsForDay = (day: Date) => filtered.filter((i) => isSameDay(i.date, day));
  const selectedItems = selectedDay ? itemsForDay(selectedDay) : [];

  const counts = useMemo(() => ({
    post: items.filter((i) => i.type === "post").length,
    podcast: items.filter((i) => i.type === "podcast").length,
    gallery: items.filter((i) => i.type === "gallery").length,
  }), [items]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Content Calendar"
        description="Plan posts, gallery uploads and podcast episodes with dates and statuses."
        icon={CalendarDays}
        badge="Planning"
      />

      {/* Filters + month nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "post", "podcast", "gallery"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={typeFilter === t ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setTypeFilter(t)}
            >
              {t === "all" ? `All (${items.length})` : `${TYPE_META[t].label}s (${counts[t]})`}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="rounded-full" onClick={() => setMonth(addMonths(month, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[140px] text-center font-bold">{format(month, "MMMM yyyy")}</div>
          <Button size="icon" variant="outline" className="rounded-full" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setMonth(startOfMonth(new Date())); setSelectedDay(null); }}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayItems = itemsForDay(day);
            const inMonth = isSameMonth(day, month);
            const selected = selectedDay && isSameDay(day, selectedDay);
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "min-h-[84px] sm:min-h-[110px] p-1.5 sm:p-2 text-left border-b border-r border-border/40 transition-colors",
                  "[&:nth-child(7n)]:border-r-0",
                  !inMonth && "opacity-40",
                  isToday(day) && "bg-primary/5",
                  selected && "bg-primary/10 ring-2 ring-inset ring-primary/40",
                  "hover:bg-muted/50",
                )}
              >
                <div className={cn(
                  "text-xs font-semibold mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayItems.slice(0, 3).map((item) => {
                    const meta = TYPE_META[item.type];
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={cn("flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium truncate", meta.chip)}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dot)} />
                        <span className="truncate">{item.title}</span>
                      </div>
                    );
                  })}
                  {dayItems.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">+{dayItems.length - 3} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 sm:p-6"
        >
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
            <Badge variant="outline" className="ml-1">{selectedItems.length} item{selectedItems.length === 1 ? "" : "s"}</Badge>
          </h3>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing planned for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item) => {
                const meta = TYPE_META[item.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 px-3 py-2.5"
                  >
                    <div className={cn("h-9 w-9 rounded-xl border flex items-center justify-center shrink-0", meta.chip)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{meta.label} · {format(item.date, "h:mm a")}</div>
                    </div>
                    <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[item.status] ?? STATUS_STYLES.draft)}>
                      {item.status}
                    </Badge>
                    <Button asChild size="sm" variant="ghost" className="rounded-full shrink-0">
                      <Link to={item.editorPath}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Edit
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground py-6">Loading calendar…</div>
      )}
    </div>
  );
};

export default ContentCalendar;
