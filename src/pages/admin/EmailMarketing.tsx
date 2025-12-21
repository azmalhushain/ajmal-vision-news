import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Users, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
}

const EmailMarketing = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string>("");
  const [customSubject, setCustomSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: subs }, { data: postsData }] = await Promise.all([
      supabase.from("newsletter_subscribers").select("*").eq("is_active", true),
      supabase.from("posts").select("id, title, excerpt, created_at").eq("status", "published").order("created_at", { ascending: false }).limit(20),
    ]);

    setSubscribers(subs || []);
    setPosts(postsData || []);
    setLoading(false);
  };

  const handleSendNewsletter = async () => {
    if (!selectedPost && !customMessage) {
      toast({ title: "Please select a post or write a custom message", variant: "destructive" });
      return;
    }

    const recipients = sendToAll ? subscribers.map((s) => s.email) : selectedEmails;
    if (recipients.length === 0) {
      toast({ title: "No recipients selected", variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      const post = posts.find((p) => p.id === selectedPost);
      
      const { error } = await supabase.functions.invoke("notify-events", {
        body: {
          event_type: "newsletter_blast",
          data: {
            recipients,
            subject: customSubject || (post ? `New Post: ${post.title}` : "Newsletter Update"),
            message: customMessage || post?.excerpt || "",
            post_title: post?.title || "",
            post_id: post?.id || "",
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Newsletter sent!",
        description: `Successfully sent to ${recipients.length} subscribers.`,
      });

      setSelectedPost("");
      setCustomSubject("");
      setCustomMessage("");
    } catch (error: any) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleNotifyNewPost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setSending(true);

    try {
      const { error } = await supabase.functions.invoke("notify-events", {
        body: {
          event_type: "new_post",
          data: {
            recipients: subscribers.map((s) => s.email),
            post_title: post.title,
            post_excerpt: post.excerpt,
            post_id: post.id,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Notification sent!",
        description: `Notified ${subscribers.length} subscribers about "${post.title}".`,
      });
    } catch (error: any) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Email Marketing</h1>
        <p className="text-muted-foreground mt-2">
          Send newsletters and notifications to your subscribers
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{subscribers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready to send</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="newsletter" className="space-y-6">
        <TabsList>
          <TabsTrigger value="newsletter">Send Newsletter</TabsTrigger>
          <TabsTrigger value="notify-post">Notify New Post</TabsTrigger>
          <TabsTrigger value="custom">Custom Email</TabsTrigger>
        </TabsList>

        <TabsContent value="newsletter">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Send Newsletter
              </CardTitle>
              <CardDescription>Select a post to send to all subscribers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Post</Label>
                <Select value={selectedPost} onValueChange={setSelectedPost}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a post..." />
                  </SelectTrigger>
                  <SelectContent>
                    {posts.map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Custom Subject (optional)</Label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Leave empty to use post title"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="sendToAll"
                  checked={sendToAll}
                  onCheckedChange={(checked) => setSendToAll(!!checked)}
                />
                <Label htmlFor="sendToAll">Send to all active subscribers ({subscribers.length})</Label>
              </div>

              <Button onClick={handleSendNewsletter} disabled={sending || !selectedPost} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Newsletter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notify-post">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Notify Subscribers of New Post
              </CardTitle>
              <CardDescription>Instantly notify all subscribers about a new post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleNotifyNewPost(post.id)}
                      disabled={sending}
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Send Custom Email
              </CardTitle>
              <CardDescription>Compose and send a custom email to subscribers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={6}
                />
              </div>

              <Button onClick={handleSendNewsletter} disabled={sending || !customSubject || !customMessage} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {subscribers.length} Subscribers
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailMarketing;
