import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Trophy, Users, Calendar, Radio, Newspaper, Image as ImageIcon, Plus, Pencil, Trash2, Upload, RefreshCw } from "lucide-react";
import { uploadSportsLogo } from "@/lib/sportsHelpers";

// Avoid type-gen lag: use the client untyped for the new tables.
const db: any = supabase;

type Row = Record<string, any>;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ============ TEAMS ============
const TeamsTab = ({ tournamentId }: { tournamentId: string }) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});

  const load = async () => {
    const { data } = await db.from("teams").select("*")
      .eq("tournament_id", tournamentId).order("display_order");
    setRows(data || []);
  };
  useEffect(() => { if (tournamentId) load(); }, [tournamentId]);

  const openNew = () => { setEditing(null); setForm({ color_primary: "#000000", color_secondary: "#FFFFFF", display_order: rows.length + 1, is_active: true }); setOpen(true); };
  const openEdit = (r: Row) => { setEditing(r); setForm({ ...r }); setOpen(true); };

  const save = async () => {
    const payload = { ...form, tournament_id: tournamentId, slug: form.slug || slugify(form.name || "") };
    const q = editing
      ? db.from("teams").update(payload).eq("id", editing.id)
      : db.from("teams").insert(payload);
    const { error } = await q;
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Team updated" : "Team created" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    const { error } = await db.from("teams").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Teams ({rows.length})</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Team</Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(r => (
            <div key={r.id} className="border rounded-lg p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ background: r.color_primary || "#000" }}>
                {r.short_name || r.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">#{r.display_order} · {r.short_name}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Team" : "New Team"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Short name</Label><Input value={form.short_name || ""} onChange={e => setForm({ ...form, short_name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug || ""} placeholder="auto" onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            </div>
            <div>
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {form.logo_url && <img src={form.logo_url} alt="" className="w-12 h-12 rounded-full object-cover border" />}
                <Input value={form.logo_url || ""} placeholder="https://… or upload →" onChange={e => setForm({ ...form, logo_url: e.target.value })} />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    try { const url = await uploadSportsLogo(f, "team"); setForm({ ...form, logo_url: url }); toast({ title: "Uploaded" }); }
                    catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
                  }} />
                  <Button type="button" size="icon" variant="outline" asChild><span><Upload className="h-4 w-4" /></span></Button>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Primary color</Label><Input type="color" value={form.color_primary || "#000000"} onChange={e => setForm({ ...form, color_primary: e.target.value })} /></div>
              <div><Label>Secondary color</Label><Input type="color" value={form.color_secondary || "#FFFFFF"} onChange={e => setForm({ ...form, color_secondary: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Home ground</Label><Input value={form.home_ground || ""} onChange={e => setForm({ ...form, home_ground: e.target.value })} /></div>
              <div><Label>Founded year</Label><Input type="number" value={form.founded_year || ""} onChange={e => setForm({ ...form, founded_year: parseInt(e.target.value) || null })} /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Display order</Label><Input type="number" value={form.display_order ?? 0} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-end gap-2"><Switch checked={form.is_active ?? true} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ============ PLAYERS ============
const PlayersTab = ({ tournamentId }: { tournamentId: string }) => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});

  const load = async () => {
    const { data: t } = await db.from("teams").select("id,name,color_primary").eq("tournament_id", tournamentId).order("display_order");
    setTeams(t || []);
    let q = db.from("players").select("*").order("jersey_number");
    if (filterTeam !== "all") q = q.eq("team_id", filterTeam);
    else if (t?.length) q = q.in("team_id", t.map((x: Row) => x.id));
    const { data } = await q;
    setRows(data || []);
  };
  useEffect(() => { if (tournamentId) load(); }, [tournamentId, filterTeam]);

  const openNew = () => { setEditing(null); setForm({ team_id: filterTeam !== "all" ? filterTeam : teams[0]?.id, role: "batter", is_active: true }); setOpen(true); };
  const openEdit = (r: Row) => { setEditing(r); setForm({ ...r }); setOpen(true); };

  const save = async () => {
    const payload = { ...form, slug: form.slug || slugify(form.name || "") };
    const q = editing ? db.from("players").update(payload).eq("id", editing.id) : db.from("players").insert(payload);
    const { error } = await q;
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Player updated" : "Player created" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    await db.from("players").delete().eq("id", id);
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Players ({rows.length})</CardTitle>
        <div className="flex gap-2">
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openNew} disabled={!teams.length}><Plus className="h-4 w-4 mr-1" /> Add Player</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(r => {
            const team = teams.find(t => t.id === r.team_id);
            return (
              <div key={r.id} className="border rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: team?.color_primary || "#666" }}>
                  {r.jersey_number ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{r.name} {r.is_captain && <Badge variant="secondary" className="ml-1 text-xs">C</Badge>}</p>
                  <p className="text-xs text-muted-foreground truncate">{team?.name} · {r.role}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            );
          })}
          {!rows.length && <p className="text-sm text-muted-foreground col-span-full text-center py-8">No players yet.</p>}
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Player" : "New Player"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Team *</Label>
              <Select value={form.team_id || ""} onValueChange={v => setForm({ ...form, team_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Name *</Label><Input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Jersey #</Label><Input type="number" value={form.jersey_number || ""} onChange={e => setForm({ ...form, jersey_number: parseInt(e.target.value) || null })} /></div>
              <div><Label>Role</Label>
                <Select value={form.role || "batter"} onValueChange={v => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="batter">Batter</SelectItem>
                    <SelectItem value="bowler">Bowler</SelectItem>
                    <SelectItem value="all-rounder">All-rounder</SelectItem>
                    <SelectItem value="wicket-keeper">Wicket-keeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Batting style</Label><Input value={form.batting_style || ""} placeholder="Right-hand bat" onChange={e => setForm({ ...form, batting_style: e.target.value })} /></div>
              <div><Label>Bowling style</Label><Input value={form.bowling_style || ""} placeholder="Right-arm fast" onChange={e => setForm({ ...form, bowling_style: e.target.value })} /></div>
            </div>
            <div><Label>Photo URL</Label><Input value={form.photo_url || ""} onChange={e => setForm({ ...form, photo_url: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea rows={3} value={form.bio || ""} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.is_captain || false} onCheckedChange={v => setForm({ ...form, is_captain: v })} /><Label>Captain</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_overseas || false} onCheckedChange={v => setForm({ ...form, is_overseas: v })} /><Label>Overseas</Label></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ============ FIXTURES ============
const FixturesTab = ({ tournamentId }: { tournamentId: string }) => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});

  const load = async () => {
    const { data: t } = await db.from("teams").select("id,name,short_name,color_primary").eq("tournament_id", tournamentId);
    setTeams(t || []);
    const { data } = await db.from("matches").select("*").eq("tournament_id", tournamentId).order("scheduled_at", { ascending: true });
    setRows(data || []);
  };
  useEffect(() => { if (tournamentId) load(); }, [tournamentId]);

  const openNew = () => { setEditing(null); setForm({ status: "scheduled", match_no: rows.length + 1 }); setOpen(true); };
  const openEdit = (r: Row) => { setEditing(r); setForm({ ...r, scheduled_at: r.scheduled_at ? new Date(r.scheduled_at).toISOString().slice(0, 16) : "" }); setOpen(true); };

  const save = async () => {
    const payload: Row = { ...form, tournament_id: tournamentId };
    if (payload.scheduled_at && typeof payload.scheduled_at === "string") payload.scheduled_at = new Date(payload.scheduled_at).toISOString();
    const q = editing ? db.from("matches").update(payload).eq("id", editing.id) : db.from("matches").insert(payload);
    const { error } = await q;
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Match updated" : "Match scheduled" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    await db.from("matches").delete().eq("id", id);
    load();
  };

  const teamName = (id: string) => teams.find(t => t.id === id)?.short_name || teams.find(t => t.id === id)?.name || "TBA";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Fixtures ({rows.length})</CardTitle>
        <Button size="sm" onClick={openNew} disabled={teams.length < 2}><Plus className="h-4 w-4 mr-1" /> Add Match</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(r => (
          <div key={r.id} className="border rounded-lg p-3 flex items-center gap-3 flex-wrap">
            <Badge variant="outline">M{r.match_no}</Badge>
            <span className="font-semibold">{teamName(r.team_a_id)} <span className="text-muted-foreground mx-1">vs</span> {teamName(r.team_b_id)}</span>
            <span className="text-sm text-muted-foreground">{r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : "TBD"}</span>
            <Badge className="capitalize" variant={r.status === "live" ? "destructive" : r.status === "completed" ? "secondary" : "outline"}>{r.status}</Badge>
            <span className="text-xs text-muted-foreground truncate flex-1">{r.venue}</span>
            <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
        {!rows.length && <p className="text-sm text-muted-foreground text-center py-8">No matches scheduled.</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Match" : "Schedule Match"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Match #</Label><Input type="number" value={form.match_no || ""} onChange={e => setForm({ ...form, match_no: parseInt(e.target.value) || null })} /></div>
              <div><Label>Status</Label>
                <Select value={form.status || "scheduled"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["scheduled","live","completed","abandoned","postponed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Team A</Label>
                <Select value={form.team_a_id || ""} onValueChange={v => setForm({ ...form, team_a_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Team B</Label>
                <Select value={form.team_b_id || ""} onValueChange={v => setForm({ ...form, team_b_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Scheduled at</Label><Input type="datetime-local" value={form.scheduled_at || ""} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} /></div>
            <div><Label>Venue</Label><Input value={form.venue || ""} onChange={e => setForm({ ...form, venue: e.target.value })} /></div>
            <div><Label>Poster URL</Label><Input value={form.poster_url || ""} onChange={e => setForm({ ...form, poster_url: e.target.value })} /></div>
            <div><Label>YouTube live URL</Label><Input value={form.youtube_url || ""} placeholder="https://youtube.com/watch?v=… or /live/…" onChange={e => setForm({ ...form, youtube_url: e.target.value })} /></div>
            <div><Label>Facebook post URL</Label><Input value={form.facebook_post_url || ""} placeholder="https://facebook.com/…" onChange={e => setForm({ ...form, facebook_post_url: e.target.value })} /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.is_featured || false} onCheckedChange={v => setForm({ ...form, is_featured: v })} /><Label>Featured</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_live_stream || false} onCheckedChange={v => setForm({ ...form, is_live_stream: v })} /><Label>Stream live on site</Label></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Schedule"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ============ LIVE SCORE CONSOLE ============
const LiveScoreTab = ({ tournamentId }: { tournamentId: string }) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Row[]>([]);
  const [teams, setTeams] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [match, setMatch] = useState<Row | null>(null);
  const [innings, setInnings] = useState<Row[]>([]);

  const loadMatches = async () => {
    const { data: t } = await db.from("teams").select("id,name,short_name").eq("tournament_id", tournamentId);
    setTeams(t || []);
    const { data } = await db.from("matches").select("*").eq("tournament_id", tournamentId)
      .in("status", ["scheduled","live"]).order("scheduled_at");
    setMatches(data || []);
  };
  const loadOne = async (id: string) => {
    const { data: m } = await db.from("matches").select("*").eq("id", id).single();
    setMatch(m);
    const { data: ins } = await db.from("match_innings").select("*").eq("match_id", id).order("innings_no");
    setInnings(ins || []);
  };
  useEffect(() => { if (tournamentId) loadMatches(); }, [tournamentId]);
  useEffect(() => { if (selectedId) loadOne(selectedId); }, [selectedId]);

  const teamName = (id: string) => teams.find(t => t.id === id)?.short_name || teams.find(t => t.id === id)?.name || "TBA";

  const updateMatch = async (patch: Row) => {
    const { error } = await db.from("matches").update(patch).eq("id", selectedId);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Saved" });
    loadOne(selectedId); loadMatches();
  };

  const ensureInnings = async (no: number) => {
    if (innings.find(i => i.innings_no === no)) return;
    const battingId = no === 1 ? match?.team_a_id : match?.team_b_id;
    const bowlingId = no === 1 ? match?.team_b_id : match?.team_a_id;
    await db.from("match_innings").insert({ match_id: selectedId, innings_no: no, batting_team_id: battingId, bowling_team_id: bowlingId, runs: 0, wickets: 0, overs: 0 });
    loadOne(selectedId);
  };

  const updateInnings = async (id: string, patch: Row) => {
    const { error } = await db.from("match_innings").update(patch).eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    loadOne(selectedId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Radio className="h-5 w-5 text-destructive animate-pulse" /> Live Score Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger><SelectValue placeholder="Select a scheduled or live match" /></SelectTrigger>
          <SelectContent>
            {matches.map(m => (
              <SelectItem key={m.id} value={m.id}>
                M{m.match_no}: {teamName(m.team_a_id)} vs {teamName(m.team_b_id)} — {m.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {match && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Label>Status:</Label>
              <Select value={match.status} onValueChange={v => updateMatch({ status: v })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>{["scheduled","live","completed","abandoned"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Label className="ml-4">Toss:</Label>
              <Select value={match.toss_winner_id || ""} onValueChange={v => updateMatch({ toss_winner_id: v })}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Winner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={match.team_a_id}>{teamName(match.team_a_id)}</SelectItem>
                  <SelectItem value={match.team_b_id}>{teamName(match.team_b_id)}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={match.toss_decision || ""} onValueChange={v => updateMatch({ toss_decision: v })}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Decision" /></SelectTrigger>
                <SelectContent><SelectItem value="bat">Bat</SelectItem><SelectItem value="bowl">Bowl</SelectItem></SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[1, 2].map(no => {
                const ins = innings.find(i => i.innings_no === no);
                if (!ins) return (
                  <div key={no} className="border rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Innings {no}</p>
                    <Button size="sm" variant="outline" onClick={() => ensureInnings(no)}>Start innings {no}</Button>
                  </div>
                );
                return (
                  <div key={no} className="border rounded-lg p-4 space-y-2">
                    <p className="font-semibold">Innings {no} — {teamName(ins.batting_team_id)}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div><Label className="text-xs">Runs</Label><Input type="number" value={ins.runs} onChange={e => updateInnings(ins.id, { runs: parseInt(e.target.value) || 0 })} /></div>
                      <div><Label className="text-xs">Wickets</Label><Input type="number" value={ins.wickets} onChange={e => updateInnings(ins.id, { wickets: parseInt(e.target.value) || 0 })} /></div>
                      <div><Label className="text-xs">Overs</Label><Input type="number" step="0.1" value={ins.overs} onChange={e => updateInnings(ins.id, { overs: parseFloat(e.target.value) || 0 })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">Extras</Label><Input type="number" value={ins.extras} onChange={e => updateInnings(ins.id, { extras: parseInt(e.target.value) || 0 })} /></div>
                      <div className="flex items-end gap-2"><Switch checked={ins.is_declared || false} onCheckedChange={v => updateInnings(ins.id, { is_declared: v })} /><Label className="text-xs">Declared</Label></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Winner</Label>
                <Select value={match.winner_id || ""} onValueChange={v => updateMatch({ winner_id: v })}>
                  <SelectTrigger><SelectValue placeholder="(none yet)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={match.team_a_id}>{teamName(match.team_a_id)}</SelectItem>
                    <SelectItem value={match.team_b_id}>{teamName(match.team_b_id)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Result text</Label><Input value={match.result_text || ""} onChange={e => setMatch({ ...match, result_text: e.target.value })} onBlur={e => updateMatch({ result_text: e.target.value })} placeholder="e.g. BMH won by 24 runs" /></div>
            </div>
            <div><Label>Commentary note</Label><Textarea rows={2} value={match.commentary_note || ""} onChange={e => setMatch({ ...match, commentary_note: e.target.value })} onBlur={e => updateMatch({ commentary_note: e.target.value })} /></div>
            <div><Label>YouTube live URL</Label><Input value={match.youtube_url || ""} placeholder="Paste a YouTube live link to broadcast on /sports" onChange={e => setMatch({ ...match, youtube_url: e.target.value })} onBlur={e => updateMatch({ youtube_url: e.target.value })} /></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ SPORTS NEWS ============
const SportsNewsTab = ({ tournamentId }: { tournamentId: string }) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});

  const load = async () => {
    const { data } = await db.from("sports_news").select("*").eq("tournament_id", tournamentId).order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { if (tournamentId) load(); }, [tournamentId]);

  const openNew = () => { setEditing(null); setForm({ status: "draft", tags: [] }); setOpen(true); };
  const openEdit = (r: Row) => { setEditing(r); setForm({ ...r, tags_text: (r.tags || []).join(", ") }); setOpen(true); };

  const save = async () => {
    const payload: Row = {
      tournament_id: tournamentId,
      title: form.title,
      slug: form.slug || slugify(form.title || ""),
      excerpt: form.excerpt,
      content: form.content,
      cover_url: form.cover_url,
      status: form.status,
      tags: typeof form.tags_text === "string" ? form.tags_text.split(",").map((s: string) => s.trim()).filter(Boolean) : (form.tags || []),
      is_pinned: !!form.is_pinned,
      published_at: form.status === "published" ? (form.published_at || new Date().toISOString()) : null,
    };
    const q = editing ? db.from("sports_news").update(payload).eq("id", editing.id) : db.from("sports_news").insert(payload);
    const { error } = await q;
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Article updated" : "Article created" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await db.from("sports_news").delete().eq("id", id);
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" /> Sports News ({rows.length})</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New article</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(r => (
          <div key={r.id} className="border rounded-lg p-3 flex items-center gap-3">
            {r.cover_url && <img src={r.cover_url} alt="" className="w-16 h-12 object-cover rounded" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{r.title}</p>
              <div className="flex gap-2 items-center text-xs text-muted-foreground">
                <Badge variant={r.status === "published" ? "default" : "outline"} className="capitalize">{r.status}</Badge>
                {r.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
        {!rows.length && <p className="text-sm text-muted-foreground text-center py-8">No sports news yet.</p>}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug || ""} placeholder="auto" onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Cover image URL</Label><Input value={form.cover_url || ""} onChange={e => setForm({ ...form, cover_url: e.target.value })} /></div>
            <div><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt || ""} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Content (HTML/markdown supported)</Label><Textarea rows={8} value={form.content || ""} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <div><Label>Tags (comma separated)</Label><Input value={form.tags_text || ""} onChange={e => setForm({ ...form, tags_text: e.target.value })} placeholder="match-report, kpl3, highlights" /></div>
            <div className="flex gap-4 items-center">
              <div><Label>Status</Label>
                <Select value={form.status || "draft"} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-6"><Switch checked={form.is_pinned || false} onCheckedChange={v => setForm({ ...form, is_pinned: v })} /><Label>Pinned</Label></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ============ MAIN PAGE ============
const SportsManager = () => {
  const [tournaments, setTournaments] = useState<Row[]>([]);
  const [tournamentId, setTournamentId] = useState<string>("");

  useEffect(() => {
    db.from("tournaments").select("*").order("display_order").then(({ data }: any) => {
      setTournaments(data || []);
      if (data?.length && !tournamentId) setTournamentId(data[0].id);
    });
  }, []);

  const current = tournaments.find(t => t.id === tournamentId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-6 w-6 text-primary" /> Sports / KPL</h1>
          <p className="text-sm text-muted-foreground">{current?.name} · {current?.season}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={async () => {
            if (!confirm("Import teams & fixtures from kplt20.org? This may take ~30s.")) return;
            const { data, error } = await supabase.functions.invoke("kpl-import");
            if (error) return alert("Import failed: " + error.message);
            alert(`KPL import: +${data?.teamsCreated || 0} teams, +${data?.matchesCreated || 0} matches.${data?.errors?.length ? "\nWarnings:\n" + data.errors.join("\n") : ""}`);
          }}><Upload className="h-4 w-4 mr-1" /> Import from kplt20.org</Button>
          <Button size="sm" variant="outline" onClick={async () => {
            const { data, error } = await supabase.functions.invoke("fb-sync-kpl");
            if (error) return alert("Sync failed: " + error.message);
            alert(`Facebook sync: ${data?.upserted || 0} posts updated.`);
          }}><RefreshCw className="h-4 w-4 mr-1" /> Sync Facebook now</Button>
          <Select value={tournamentId} onValueChange={setTournamentId}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Select tournament" /></SelectTrigger>
            <SelectContent>{tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.season})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {tournamentId && (
        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="teams"><Users className="h-4 w-4 mr-1" /> Teams</TabsTrigger>
            <TabsTrigger value="players"><Users className="h-4 w-4 mr-1" /> Players</TabsTrigger>
            <TabsTrigger value="fixtures"><Calendar className="h-4 w-4 mr-1" /> Fixtures</TabsTrigger>
            <TabsTrigger value="live"><Radio className="h-4 w-4 mr-1" /> Live Score</TabsTrigger>
            <TabsTrigger value="news"><Newspaper className="h-4 w-4 mr-1" /> News</TabsTrigger>
            <TabsTrigger value="media"><ImageIcon className="h-4 w-4 mr-1" /> Media</TabsTrigger>
          </TabsList>
          <TabsContent value="teams"><TeamsTab tournamentId={tournamentId} /></TabsContent>
          <TabsContent value="players"><PlayersTab tournamentId={tournamentId} /></TabsContent>
          <TabsContent value="fixtures"><FixturesTab tournamentId={tournamentId} /></TabsContent>
          <TabsContent value="live"><LiveScoreTab tournamentId={tournamentId} /></TabsContent>
          <TabsContent value="news"><SportsNewsTab tournamentId={tournamentId} /></TabsContent>
          <TabsContent value="media">
            <Card><CardHeader><CardTitle>Media</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Bulk media upload (reuses Gallery uploader) ships in 4C with the public sports portal. Use the Gallery editor for now and tag images with &ldquo;KPL3&rdquo;.</p></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SportsManager;
