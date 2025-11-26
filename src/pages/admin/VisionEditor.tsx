import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const VisionEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_line1: "",
    title_line2: "",
    title_line3: "",
    description: "",
    stat1_number: "",
    stat1_label: "",
    stat2_number: "",
    stat2_label: "",
    stat3_number: "",
    stat3_label: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("vision_content")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      toast({
        title: "Error",
        description: "Failed to fetch vision content",
        variant: "destructive",
      });
    } else if (data) {
      setContentId(data.id);
      setFormData(data);
    }
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = contentId
        ? await supabase
            .from("vision_content")
            .update(formData)
            .eq("id", contentId)
        : await supabase.from("vision_content").insert(formData);

      if (error) throw error;

      toast({ title: "Vision section updated successfully" });
      if (!contentId) fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Edit Vision Section</h1>
        <p className="text-muted-foreground mt-2">
          Customize your vision statement and statistics
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label>Title Line 1</Label>
              <Input
                value={formData.title_line1}
                onChange={(e) => handleChange("title_line1", e.target.value)}
              />
            </div>

            <div>
              <Label>Title Line 2</Label>
              <Input
                value={formData.title_line2}
                onChange={(e) => handleChange("title_line2", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Title Line 3</Label>
              <Input
                value={formData.title_line3}
                onChange={(e) => handleChange("title_line3", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label>Stat 1 Number</Label>
              <Input
                value={formData.stat1_number}
                onChange={(e) => handleChange("stat1_number", e.target.value)}
              />
            </div>

            <div>
              <Label>Stat 1 Label</Label>
              <Input
                value={formData.stat1_label}
                onChange={(e) => handleChange("stat1_label", e.target.value)}
              />
            </div>

            <div>
              <Label>Stat 2 Number</Label>
              <Input
                value={formData.stat2_number}
                onChange={(e) => handleChange("stat2_number", e.target.value)}
              />
            </div>

            <div>
              <Label>Stat 2 Label</Label>
              <Input
                value={formData.stat2_label}
                onChange={(e) => handleChange("stat2_label", e.target.value)}
              />
            </div>

            <div>
              <Label>Stat 3 Number</Label>
              <Input
                value={formData.stat3_number}
                onChange={(e) => handleChange("stat3_number", e.target.value)}
              />
            </div>

            <div>
              <Label>Stat 3 Label</Label>
              <Input
                value={formData.stat3_label}
                onChange={(e) => handleChange("stat3_label", e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default VisionEditor;
