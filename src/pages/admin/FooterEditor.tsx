import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FooterEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    site_name: "",
    site_description: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    youtube_url: "",
    address: "",
    phone: "",
    email: "",
    copyright_text: "",
    tagline: "",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("footer_content")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setContentId(data.id);
      setFormData({
        site_name: data.site_name,
        site_description: data.site_description,
        facebook_url: data.facebook_url || "",
        twitter_url: data.twitter_url || "",
        instagram_url: data.instagram_url || "",
        youtube_url: data.youtube_url || "",
        address: data.address,
        phone: data.phone,
        email: data.email,
        copyright_text: data.copyright_text,
        tagline: data.tagline,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    if (contentId) {
      const { error } = await supabase
        .from("footer_content")
        .update(formData)
        .eq("id", contentId);

      if (error) {
        toast({ title: "Error saving content", variant: "destructive" });
      } else {
        toast({ title: "Footer content saved successfully!" });
      }
    }

    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Footer Editor</h1>
            <p className="text-muted-foreground mt-2">Edit the website footer content</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Site Description</label>
              <Textarea
                value={formData.site_description}
                onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Copyright Text</label>
                <Input
                  value={formData.copyright_text}
                  onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tagline</label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Facebook URL</label>
                <Input
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Twitter URL</label>
                <Input
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram URL</label>
                <Input
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">YouTube URL</label>
                <Input
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FooterEditor;
