import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, RefreshCw, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  body_html: string;
  is_active: boolean;
}

const templateLabels: Record<string, { label: string; description: string; variables: string[] }> = {
  new_comment: {
    label: "New Comment",
    description: "Sent when someone comments on a post",
    variables: ["post_title", "author_name", "content"],
  },
  new_subscriber: {
    label: "New Subscriber",
    description: "Sent when someone subscribes to the newsletter",
    variables: ["email", "subscribed_at"],
  },
  new_user: {
    label: "New User Registration",
    description: "Sent when a new user signs up",
    variables: ["full_name", "email"],
  },
  contact_form: {
    label: "Contact Form",
    description: "Sent when someone submits the contact form",
    variables: ["name", "email", "phone", "subject", "message"],
  },
  new_post: {
    label: "New Post Published",
    description: "Sent when a new post is published",
    variables: ["title", "category", "excerpt"],
  },
};

const EmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("template_type");

    if (data) setTemplates(data);
    if (error) console.error("Error fetching templates:", error);
    setLoading(false);
  };

  const handleSave = async (template: EmailTemplate) => {
    setSaving(template.id);
    const { error } = await supabase
      .from("email_templates")
      .update({
        subject: template.subject,
        body_html: template.body_html,
        is_active: template.is_active,
      })
      .eq("id", template.id);

    if (error) {
      toast({ title: "Error saving template", variant: "destructive" });
    } else {
      toast({ title: "Template saved successfully!" });
    }
    setSaving(null);
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const getPreviewHtml = (template: EmailTemplate) => {
    let html = template.body_html;
    const info = templateLabels[template.template_type];
    if (info) {
      info.variables.forEach((v) => {
        html = html.replace(new RegExp(`{{${v}}}`, "g"), `[Sample ${v}]`);
      });
    }
    return html;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <p className="text-muted-foreground mt-2">
          Customize notification email templates. Use {"{{variable}}"} syntax for dynamic content.
        </p>
      </motion.div>

      <div className="grid gap-6">
        {templates.map((template, index) => {
          const info = templateLabels[template.template_type] || {
            label: template.template_type,
            description: "",
            variables: [],
          };
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {info.label}
                          {!template.is_active && (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{info.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) =>
                          updateTemplate(template.id, { is_active: checked })
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Subject Line</label>
                    <Input
                      value={template.subject}
                      onChange={(e) =>
                        updateTemplate(template.id, { subject: e.target.value })
                      }
                      placeholder="Email subject..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Body (HTML)</label>
                    <Textarea
                      value={template.body_html}
                      onChange={(e) =>
                        updateTemplate(template.id, { body_html: e.target.value })
                      }
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {info.variables.map((v) => (
                        <Badge key={v} variant="outline" className="text-xs">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleSave(template)}
                      disabled={saving === template.id}
                    >
                      {saving === template.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="font-semibold">{previewTemplate.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Body</label>
                <div
                  className="mt-2 p-4 bg-card border rounded-lg prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml(previewTemplate) }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplates;