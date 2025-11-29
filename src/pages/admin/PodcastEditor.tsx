import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Pin, Loader2, Mic } from "lucide-react";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  cover_image_url: string | null;
  duration: string | null;
  is_pinned: boolean;
  is_active: boolean;
  display_order: number;
}

const PodcastEditor = () => {
  const { toast } = useToast();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audio_url: "",
    cover_image_url: "",
    duration: "",
    is_pinned: false,
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error fetching podcasts", variant: "destructive" });
    } else {
      setPodcasts(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (file: File, type: "audio" | "image") => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${Math.random()}.${fileExt}`;
      const filePath = `podcasts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      if (type === "audio") {
        setFormData({ ...formData, audio_url: publicUrl });
      } else {
        setFormData({ ...formData, cover_image_url: publicUrl });
      }

      toast({ title: "File uploaded successfully" });
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.audio_url) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editingPodcast) {
        const { error } = await supabase
          .from("podcasts")
          .update(formData)
          .eq("id", editingPodcast.id);

        if (error) throw error;
        toast({ title: "Podcast updated successfully" });
      } else {
        const { error } = await supabase.from("podcasts").insert(formData);
        if (error) throw error;
        toast({ title: "Podcast created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPodcasts();
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setFormData({
      title: podcast.title,
      description: podcast.description || "",
      audio_url: podcast.audio_url,
      cover_image_url: podcast.cover_image_url || "",
      duration: podcast.duration || "",
      is_pinned: podcast.is_pinned,
      is_active: podcast.is_active,
      display_order: podcast.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("podcasts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting podcast", variant: "destructive" });
    } else {
      toast({ title: "Podcast deleted successfully" });
      fetchPodcasts();
    }
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    const { error } = await supabase
      .from("podcasts")
      .update({ is_pinned: !currentPinned })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating podcast", variant: "destructive" });
    } else {
      toast({ title: currentPinned ? "Unpinned" : "Pinned" });
      fetchPodcasts();
    }
  };

  const resetForm = () => {
    setEditingPodcast(null);
    setFormData({
      title: "",
      description: "",
      audio_url: "",
      cover_image_url: "",
      duration: "",
      is_pinned: false,
      is_active: true,
      display_order: 0,
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Podcast Management</h1>
            <p className="text-muted-foreground mt-2">Manage your podcast episodes</p>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Podcast
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>All Podcasts ({podcasts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pinned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {podcasts.map((podcast) => (
                  <TableRow key={podcast.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Mic className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{podcast.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {podcast.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{podcast.duration || "N/A"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${podcast.is_active ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
                        {podcast.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePin(podcast.id, podcast.is_pinned)}
                      >
                        <Pin className={`h-4 w-4 ${podcast.is_pinned ? "text-primary fill-primary" : ""}`} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(podcast)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(podcast.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPodcast ? "Edit Podcast" : "Add Podcast"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Podcast title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Podcast description"
                rows={3}
              />
            </div>
            <div>
              <Label>Audio File *</Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "audio")}
                disabled={uploading}
              />
              {formData.audio_url && (
                <audio controls className="mt-2 w-full">
                  <source src={formData.audio_url} />
                </audio>
              )}
            </div>
            <div>
              <Label>Cover Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "image")}
                disabled={uploading}
              />
              {formData.cover_image_url && (
                <img src={formData.cover_image_url} alt="Cover" className="mt-2 w-32 h-32 object-cover rounded" />
              )}
            </div>
            <div>
              <Label>Duration (e.g., "45:30")</Label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="00:00"
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                />
                <Label>Pinned</Label>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={saving || uploading} className="w-full">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Podcast"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PodcastEditor;