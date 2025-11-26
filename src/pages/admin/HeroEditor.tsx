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

const HeroEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_line1: "",
    title_line2: "",
    title_line3: "",
    description: "",
    button1_text: "",
    button1_link: "",
    button2_text: "",
    button2_link: "",
    hero_image_url: "",
    stat1_number: "",
    stat1_label: "",
    stat2_number: "",
    stat2_label: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("hero_content")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      toast({
        title: "Error",
        description: "Failed to fetch hero content",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      handleChange("hero_image_url", publicUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = contentId
        ? await supabase
            .from("hero_content")
            .update(formData)
            .eq("id", contentId)
        : await supabase.from("hero_content").insert(formData);

      if (error) throw error;

      toast({ title: "Hero section updated successfully" });
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
        <h1 className="text-3xl font-bold">Edit Hero Section</h1>
        <p className="text-muted-foreground mt-2">
          Customize your homepage hero section
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Hero Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {formData.hero_image_url && (
                <img
                  src={formData.hero_image_url}
                  alt="Hero"
                  className="mt-2 w-full max-w-xs rounded-lg"
                />
              )}
            </div>

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
                rows={3}
              />
            </div>

            <div>
              <Label>Button 1 Text</Label>
              <Input
                value={formData.button1_text}
                onChange={(e) => handleChange("button1_text", e.target.value)}
              />
            </div>

            <div>
              <Label>Button 1 Link</Label>
              <Input
                value={formData.button1_link}
                onChange={(e) => handleChange("button1_link", e.target.value)}
              />
            </div>

            <div>
              <Label>Button 2 Text</Label>
              <Input
                value={formData.button2_text}
                onChange={(e) => handleChange("button2_text", e.target.value)}
              />
            </div>

            <div>
              <Label>Button 2 Link</Label>
              <Input
                value={formData.button2_link}
                onChange={(e) => handleChange("button2_link", e.target.value)}
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

export default HeroEditor;
