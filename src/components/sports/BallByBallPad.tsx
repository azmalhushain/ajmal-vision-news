import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Sparkles, Undo2, Trash2 } from "lucide-react";

const db: any = supabase;

interface Props { matchId: string; onChange?: () => void; }

/**
 * Ball-by-ball entry pad. Admin clicks 0/1/2/3/4/6/W/WD/NB → event saved → AI recompute called.
 * Real-time score then propagates to all viewers via the LiveScoreTicker.
 */
export const BallByBallPad = ({ matchId, onChange }: Props) => {
  const { toast } = useToast();
  const [innings, setInnings] = useState<number>(1);
  const [batter, setBatter] = useState("");
  const [bowler, setBowler] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const loadEvents = async () => {
    const { data } = await db.from("match_events").select("*")
      .eq("match_id", matchId).order("over_no", { ascending: false }).order("ball_no", { ascending: false }).limit(12);
    setEvents(data || []);
  };
  useEffect(() => { loadEvents(); }, [matchId]);

  const recompute = async () => {
    const { error } = await supabase.functions.invoke("sports-ai", { body: { action: "recompute-score", payload: { matchId } } });
    if (error) toast({ title: "AI recompute failed", description: error.message, variant: "destructive" });
    onChange?.();
  };

  const addBall = async (opts: { runs?: number; wicket?: boolean; extra?: "wd" | "nb" | "b" | "lb"; extra_runs?: number; note?: string }) => {
    setBusy(true);
    try {
      // Compute next over/ball
      const { data: last } = await db.from("match_events").select("over_no, ball_no, extra_type").eq("match_id", matchId).eq("innings_no", innings)
        .order("over_no", { ascending: false }).order("ball_no", { ascending: false }).limit(1).maybeSingle();
      let over = last?.over_no || 0; let ball = last?.ball_no || 0;
      const wasExtra = last?.extra_type === "wd" || last?.extra_type === "nb";
      const isExtra = opts.extra === "wd" || opts.extra === "nb";
      if (!wasExtra) { ball += 1; if (ball > 6) { ball = 1; over += 1; } }
      // Even if it's an extra, store under same over/ball position; reuse last ball_no
      if (isExtra && ball === 0) { ball = 1; }

      await db.from("match_events").insert({
        match_id: matchId, innings_no: innings, over_no: over, ball_no: ball,
        runs: opts.runs ?? 0, is_wicket: !!opts.wicket,
        extra_type: opts.extra || null, extra_runs: opts.extra_runs ?? (isExtra ? 1 : 0),
        batter: batter || null, bowler: bowler || null, note: opts.note || null,
      });
      await loadEvents();
      await recompute();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const undo = async () => {
    const { data: last } = await db.from("match_events").select("id").eq("match_id", matchId).eq("innings_no", innings)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!last) return;
    await db.from("match_events").delete().eq("id", last.id);
    await loadEvents(); await recompute();
  };

  const clearInnings = async () => {
    if (!confirm(`Clear all ball-by-ball events for innings ${innings}?`)) return;
    await db.from("match_events").delete().eq("match_id", matchId).eq("innings_no", innings);
    await loadEvents(); await recompute();
  };

  const generateSummary = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("sports-ai", { body: { action: "match-summary", payload: { matchId } } });
      if (error) throw error;
      setSummary((data as any)?.summary || "");
      toast({ title: "AI summary ready" });
    } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const buttons: { label: string; onClick: () => void; variant?: "default" | "secondary" | "destructive" | "outline" }[] = [
    { label: "0", onClick: () => addBall({ runs: 0 }), variant: "outline" },
    { label: "1", onClick: () => addBall({ runs: 1 }), variant: "outline" },
    { label: "2", onClick: () => addBall({ runs: 2 }), variant: "outline" },
    { label: "3", onClick: () => addBall({ runs: 3 }), variant: "outline" },
    { label: "4", onClick: () => addBall({ runs: 4 }), variant: "secondary" },
    { label: "6", onClick: () => addBall({ runs: 6 }), variant: "secondary" },
    { label: "W", onClick: () => addBall({ wicket: true }), variant: "destructive" },
    { label: "Wd", onClick: () => addBall({ extra: "wd", extra_runs: 1 }), variant: "outline" },
    { label: "Nb", onClick: () => addBall({ extra: "nb", extra_runs: 1 }), variant: "outline" },
  ];

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Innings</Label>
          <Select value={String(innings)} onValueChange={v => setInnings(Number(v))}>
            <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={undo} disabled={busy}><Undo2 className="h-3.5 w-3.5 mr-1" /> Undo</Button>
          <Button size="sm" variant="ghost" onClick={clearInnings} disabled={busy}><Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" /> Clear</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Batter (optional)" value={batter} onChange={e => setBatter(e.target.value)} className="h-8 text-xs" />
        <Input placeholder="Bowler (optional)" value={bowler} onChange={e => setBowler(e.target.value)} className="h-8 text-xs" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
        {buttons.map(b => (
          <motion.div key={b.label} whileTap={{ scale: 0.9 }}>
            <Button size="sm" className="w-full font-bold h-10" variant={b.variant || "outline"} disabled={busy} onClick={b.onClick}>
              {b.label}
            </Button>
          </motion.div>
        ))}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Recent balls</p>
        <div className="flex gap-1 flex-wrap">
          {events.length === 0 && <span className="text-xs text-muted-foreground">No balls bowled yet.</span>}
          {events.map(e => {
            const tag = e.is_wicket ? "W" : e.extra_type ? e.extra_type.toUpperCase() : String(e.runs);
            const v = e.is_wicket ? "destructive" : (e.runs >= 4 ? "secondary" : "outline");
            return <Badge key={e.id} variant={v as any} className="font-bold tabular-nums">{e.over_no}.{e.ball_no} {tag}</Badge>;
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button size="sm" variant="default" onClick={generateSummary} disabled={busy}>
          <Sparkles className="h-4 w-4 mr-1" /> AI Match Summary
        </Button>
      </div>
      {summary && (
        <div className="bg-background rounded p-3 text-sm whitespace-pre-wrap border">{summary}</div>
      )}
    </div>
  );
};
