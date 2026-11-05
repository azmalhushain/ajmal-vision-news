import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Send, Loader2, Smartphone, Monitor, Users, History, Link2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Device = "android" | "ios" | "desktop";

const PushNotifications = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/news");
  const [image, setImage] = useState("");
  const [device, setDevice] = useState<Device>("android");
  const [sending, setSending] = useState(false);
  const [subs, setSubs] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const load = async () => {
    const [{ count }, { data: h }, { data: p }] = await Promise.all([
      supabase.from("push_subscriptions").select("*", { count: "exact", head: true }),
      supabase.from("push_notifications").select("*").order("sent_at", { ascending: false }).limit(10),
      (supabase.from("posts") as any).select("id,title,excerpt,image_url").eq("published", true).order("created_at", { ascending: false }).limit(8),
    ]);
    setSubs(count ?? 0);
    setHistory(h || []);
    setPosts(p || []);
  };
  useEffect(() => { load(); }, []);

  const usePost = (p: any) => {
    setTitle(p.title.slice(0, 120));
    setBody((p.excerpt || "").replace(/<[^>]+>/g, "").slice(0, 300));
    setUrl(`/news?post=${p.id}`);
    setImage(p.image_url || "");
  };

  const send = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-push", {
      body: { title: title.trim(), body: body.trim(), url, image: image || undefined },
    });
    setSending(false);
    if (error || data?.error) {
      toast({ title: "Could not send", description: error?.message || data.error, variant: "destructive" });
      return;
    }
    toast({ title: "Notification sent", description: `Delivered to ${data.sent} of ${data.total} devices.` });
    setTitle(""); setBody(""); setImage("");
    load();
  };

  const t = title || "Notification title";
  const b = body || "Your message will appear here for subscribers.";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Bell className="h-7 w-7 text-primary" /> Push Notifications</h1>
          <p className="text-muted-foreground text-sm">Send instant alerts to visitors' phones and computers.</p>
        </div>
        <Card className="px-5 py-3 flex items-center gap-3 bg-card/60 backdrop-blur">
          <Users className="h-5 w-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Subscribed devices</p><p className="text-xl font-bold">{subs ?? "—"}</p></div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <Card className="bg-card/60 backdrop-blur">
          <CardHeader><CardTitle>Compose</CardTitle><CardDescription>Start from a news post or write your own.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {posts.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {posts.map((p) => (
                  <button key={p.id} onClick={() => usePost(p)} className="shrink-0 max-w-[200px] truncate text-xs rounded-full border border-border px-3 py-1.5 hover:bg-accent hover:text-accent-foreground transition">
                    {p.title}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label>Title</Label><span className="text-xs text-muted-foreground">{title.length}/120</span></div>
              <Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New road project begins tomorrow" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label>Message</Label><span className="text-xs text-muted-foreground">{body.length}/300</span></div>
              <Textarea rows={4} value={body} maxLength={300} onChange={(e) => setBody(e.target.value)} placeholder="Short, clear message for citizens" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> Opens page</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/news" /></div>
              <div className="space-y-1.5"><Label className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Image link (optional)</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" /></div>
            </div>
            <Button onClick={send} disabled={sending || !title.trim() || !body.trim() || !url.startsWith("/")} className="w-full" size="lg">
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send to {subs ?? 0} devices
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Live preview</CardTitle>
            <Tabs value={device} onValueChange={(v) => setDevice(v as Device)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="android"><Smartphone className="h-4 w-4 mr-1" />Android</TabsTrigger>
                <TabsTrigger value="ios"><Smartphone className="h-4 w-4 mr-1" />iPhone</TabsTrigger>
                <TabsTrigger value="desktop"><Monitor className="h-4 w-4 mr-1" />Desktop</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className={`rounded-3xl p-4 min-h-[260px] bg-gradient-to-br from-primary/30 via-muted to-secondary ${device === "desktop" ? "rounded-xl" : ""}`}>
              <motion.div key={device + t + b + image} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className={`bg-background/90 backdrop-blur-xl shadow-xl border border-border overflow-hidden ${device === "ios" ? "rounded-2xl" : device === "android" ? "rounded-xl" : "rounded-lg ml-auto max-w-[300px]"}`}>
                <div className="p-3 flex gap-3">
                  <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-lg shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{device === "desktop" ? "ajmalakhtar.com.np" : "Ajmal Akhtar Azad"}</span><span>now</span>
                    </div>
                    <p className="font-semibold text-sm leading-snug line-clamp-2">{t}</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">{b}</p>
                  </div>
                </div>
                {image && device !== "ios" && <img src={image} alt="" className="w-full h-32 object-cover" />}
                {device === "android" && (
                  <div className="flex gap-6 px-4 py-2 text-xs font-semibold text-primary border-t border-border"><span>READ MORE</span><span>DISMISS</span></div>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" /> Recent notifications</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 && <p className="text-sm text-muted-foreground">Nothing sent yet.</p>}
          {history.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
              <div className="min-w-0"><p className="font-medium text-sm truncate">{n.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{n.body}</p></div>
              <Badge variant="secondary" className="shrink-0">{n.sent_at ? format(new Date(n.sent_at), "MMM d, p") : "—"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotifications;
