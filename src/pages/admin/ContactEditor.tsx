import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const ContactEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hero_title_line1: "GET IN",
    hero_title_line2: "TOUCH",
    hero_description: "",
    office_address: "",
    phone_numbers: "",
    email_addresses: "",
    office_hours: "",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("contact_content")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setContentId(data.id);
      setFormData({
        hero_title_line1: data.hero_title_line1,
        hero_title_line2: data.hero_title_line2,
        hero_description: data.hero_description,
        office_address: data.office_address,
        phone_numbers: data.phone_numbers,
        email_addresses: data.email_addresses,
        office_hours: data.office_hours,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    if (contentId) {
      const { error } = await supabase
        .from("contact_content")
        .update(formData)
        .eq("id", contentId);

      if (error) {
        toast({ title: "Error saving content", variant: "destructive" });
      } else {
        toast({ title: "Content saved successfully!" });
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
            <h1 className="text-3xl font-bold">Contact Page Editor</h1>
            <p className="text-muted-foreground mt-2">Edit the Contact page content</p>
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
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Office Address</label>
              <Textarea
                value={formData.office_address}
                onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                rows={3}
                placeholder="Use new lines for multiple lines"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Numbers</label>
              <Textarea
                value={formData.phone_numbers}
                onChange={(e) => setFormData({ ...formData, phone_numbers: e.target.value })}
                rows={2}
                placeholder="Use new lines for multiple numbers"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Addresses</label>
              <Textarea
                value={formData.email_addresses}
                onChange={(e) => setFormData({ ...formData, email_addresses: e.target.value })}
                rows={2}
                placeholder="Use new lines for multiple emails"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Office Hours</label>
              <Textarea
                value={formData.office_hours}
                onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
                rows={2}
                placeholder="Use new lines for different days"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactEditor;
