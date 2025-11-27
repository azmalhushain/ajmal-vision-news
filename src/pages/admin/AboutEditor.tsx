import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Upload } from "lucide-react";

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface Achievement {
  number: string;
  title: string;
  description: string;
}

const AboutEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    hero_title_line1: "MEET",
    hero_title_line2: "AJMAL AKHTAR AZAD",
    hero_description: "",
    bio_title: "The Journey",
    bio_content: "",
    bio_image_url: "",
  });

  const [values, setValues] = useState<Value[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("about_content")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setContentId(data.id);
      setFormData({
        hero_title_line1: data.hero_title_line1,
        hero_title_line2: data.hero_title_line2,
        hero_description: data.hero_description,
        bio_title: data.bio_title,
        bio_content: data.bio_content,
        bio_image_url: data.bio_image_url || "",
      });
      setValues(data.values_json as unknown as Value[]);
      setAchievements(data.achievements_json as unknown as Achievement[]);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `about-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Error uploading image", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    setFormData({ ...formData, bio_image_url: urlData.publicUrl });
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    if (contentId) {
      const { error } = await supabase
        .from("about_content")
        .update({
          ...formData,
          values_json: JSON.parse(JSON.stringify(values)),
          achievements_json: JSON.parse(JSON.stringify(achievements)),
        })
        .eq("id", contentId);

      if (error) {
        toast({ title: "Error saving content", variant: "destructive" });
      } else {
        toast({ title: "Content saved successfully!" });
      }
    }

    setSaving(false);
  };

  const addValue = () => {
    setValues([...values, { icon: "Star", title: "", description: "" }]);
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, field: keyof Value, value: string) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    setValues(updated);
  };

  const addAchievement = () => {
    setAchievements([...achievements, { number: "", title: "", description: "" }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const updateAchievement = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">About Page Editor</h1>
            <p className="text-muted-foreground mt-2">Edit the About page content</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title Line 1</label>
                <Input
                  value={formData.hero_title_line1}
                  onChange={(e) => setFormData({ ...formData, hero_title_line1: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title Line 2</label>
                <Input
                  value={formData.hero_title_line2}
                  onChange={(e) => setFormData({ ...formData, hero_title_line2: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.hero_description}
                onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Biography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Biography Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Section Title</label>
              <Input
                value={formData.bio_title}
                onChange={(e) => setFormData({ ...formData, bio_title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Biography Content</label>
              <Textarea
                value={formData.bio_content}
                onChange={(e) => setFormData({ ...formData, bio_content: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Biography Image</label>
              <div className="flex items-center gap-4 mt-2">
                {formData.bio_image_url && (
                  <img src={formData.bio_image_url} alt="Bio" className="w-32 h-32 object-cover rounded" />
                )}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mission & Values</CardTitle>
              <Button variant="outline" size="sm" onClick={addValue}>
                <Plus className="mr-2 h-4 w-4" /> Add Value
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {values.map((value, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border rounded">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Icon</label>
                    <Input
                      value={value.icon}
                      onChange={(e) => updateValue(index, "icon", e.target.value)}
                      placeholder="e.g., Star, Heart"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={value.title}
                      onChange={(e) => updateValue(index, "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={value.description}
                      onChange={(e) => updateValue(index, "description", e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeValue(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Key Achievements</CardTitle>
              <Button variant="outline" size="sm" onClick={addAchievement}>
                <Plus className="mr-2 h-4 w-4" /> Add Achievement
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border rounded">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Number</label>
                    <Input
                      value={achievement.number}
                      onChange={(e) => updateAchievement(index, "number", e.target.value)}
                      placeholder="e.g., 25+"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={achievement.title}
                      onChange={(e) => updateAchievement(index, "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={achievement.description}
                      onChange={(e) => updateAchievement(index, "description", e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAchievement(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutEditor;
