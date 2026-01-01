import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Users, FileText, Loader2, CheckCircle, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface ScheduledEmail {
  id: string;
  subject: string;
  scheduledAt: Date;
  recipientCount: number;
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
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
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
      
      // Handle scheduling
      if (isScheduled && scheduleDate) {
        const [hours, minutes] = scheduleTime.split(":").map(Number);
        const scheduledDateTime = new Date(scheduleDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        
        // Add to scheduled emails (in a real app, save to database)
        const newScheduled: ScheduledEmail = {
          id: crypto.randomUUID(),
          subject: customSubject || (post ? `New Post: ${post.title}` : "Newsletter Update"),
          scheduledAt: scheduledDateTime,
          recipientCount: recipients.length,
        };
        setScheduledEmails(prev => [...prev, newScheduled]);
        
        toast({
          title: "Email scheduled!",
          description: `Will be sent on ${format(scheduledDateTime, "PPP 'at' p")} to ${recipients.length} subscribers.`,
        });
        
        // Reset form
        setSelectedPost("");
        setCustomSubject("");
        setCustomMessage("");
        setScheduleDate(undefined);
        setIsScheduled(false);
        setSending(false);
        return;
      }
      
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

  const cancelScheduledEmail = (id: string) => {
    setScheduledEmails(prev => prev.filter(e => e.id !== id));
    toast({ title: "Scheduled email cancelled" });
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

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{scheduledEmails.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="newsletter" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="newsletter">Send Newsletter</TabsTrigger>
          <TabsTrigger value="notify-post">Notify New Post</TabsTrigger>
          <TabsTrigger value="custom">Custom Email</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledEmails.length})</TabsTrigger>
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

              {/* Schedule Option */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="scheduleEmail"
                    checked={isScheduled}
                    onCheckedChange={(checked) => setIsScheduled(!!checked)}
                  />
                  <Label htmlFor="scheduleEmail" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule for later
                  </Label>
                </div>

                {isScheduled && (
                  <div className="grid gap-4 sm:grid-cols-2 pl-6">
                    <div>
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduleDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={scheduleDate}
                            onSelect={setScheduleDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSendNewsletter} disabled={sending || !selectedPost} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isScheduled ? "Scheduling..." : "Sending..."}
                  </>
                ) : (
                  <>
                    {isScheduled ? <Calendar className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                    {isScheduled ? "Schedule Newsletter" : "Send Newsletter"}
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

              {/* Schedule Option for Custom Email */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="scheduleCustom"
                    checked={isScheduled}
                    onCheckedChange={(checked) => setIsScheduled(!!checked)}
                  />
                  <Label htmlFor="scheduleCustom" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule for later
                  </Label>
                </div>

                {isScheduled && (
                  <div className="grid gap-4 sm:grid-cols-2 pl-6">
                    <div>
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduleDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={scheduleDate}
                            onSelect={setScheduleDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSendNewsletter} disabled={sending || !customSubject || !customMessage} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isScheduled ? "Scheduling..." : "Sending..."}
                  </>
                ) : (
                  <>
                    {isScheduled ? <Calendar className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                    {isScheduled ? "Schedule Email" : `Send to ${subscribers.length} Subscribers`}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Scheduled Emails
              </CardTitle>
              <CardDescription>Manage your scheduled email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No scheduled emails</p>
                  <p className="text-sm">Schedule an email campaign to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledEmails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div>
                        <h4 className="font-medium">{email.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(email.scheduledAt, "PPP 'at' p")} • {email.recipientCount} recipients
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelScheduledEmail(email.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailMarketing;
