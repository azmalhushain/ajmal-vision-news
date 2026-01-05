import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Users, FileText, Loader2, CheckCircle, Calendar, Clock, BarChart3, MousePointer, Eye, Tag, Target, Plus, X } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
  segment?: string;
  interests?: string[];
  engagement_score?: number;
  name?: string;
}

interface ScheduledEmail {
  id: string;
  subject: string;
  scheduledAt: Date;
  recipientCount: number;
}

const AVAILABLE_INTERESTS = [
  "Infrastructure",
  "Healthcare",
  "Education",
  "Youth & Women",
  "Environment",
  "Digital",
  "Agriculture",
  "News",
  "Events",
];

const SEGMENTS = [
  { value: "all", label: "All Subscribers" },
  { value: "general", label: "General" },
  { value: "highly_engaged", label: "Highly Engaged" },
  { value: "new_subscribers", label: "New Subscribers" },
  { value: "inactive", label: "Inactive" },
];

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
  
  // Segmentation state
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [minEngagementScore, setMinEngagementScore] = useState(0);
  const [segmentedCount, setSegmentedCount] = useState(0);
  
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
    setSegmentedCount(subs?.length || 0);
    setLoading(false);
  };

  // Update segmented count when filters change
  useEffect(() => {
    let filtered = subscribers;
    
    if (selectedSegment !== "all") {
      filtered = filtered.filter(s => s.segment === selectedSegment);
    }
    
    if (selectedInterests.length > 0) {
      filtered = filtered.filter(s => 
        s.interests?.some(i => selectedInterests.includes(i))
      );
    }
    
    if (minEngagementScore > 0) {
      filtered = filtered.filter(s => 
        (s.engagement_score || 0) >= minEngagementScore
      );
    }
    
    setSegmentedCount(filtered.length);
  }, [selectedSegment, selectedInterests, minEngagementScore, subscribers]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const getFilteredRecipients = (): string[] => {
    let filtered = subscribers;
    
    if (selectedSegment !== "all") {
      filtered = filtered.filter(s => s.segment === selectedSegment);
    }
    
    if (selectedInterests.length > 0) {
      filtered = filtered.filter(s => 
        s.interests?.some(i => selectedInterests.includes(i))
      );
    }
    
    if (minEngagementScore > 0) {
      filtered = filtered.filter(s => 
        (s.engagement_score || 0) >= minEngagementScore
      );
    }
    
    return filtered.map(s => s.email);
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
          <TabsTrigger value="segmented">Segmented Email</TabsTrigger>
          <TabsTrigger value="notify-post">Notify New Post</TabsTrigger>
          <TabsTrigger value="custom">Custom Email</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledEmails.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

        <TabsContent value="segmented">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Segmented Email Campaign
              </CardTitle>
              <CardDescription>Send targeted emails based on subscriber interests and engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Segment Selection */}
              <div>
                <Label>Target Segment</Label>
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a segment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SEGMENTS.map((segment) => (
                      <SelectItem key={segment.value} value={segment.value}>
                        {segment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Tags */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4" />
                  Filter by Interests
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Engagement Score */}
              <div>
                <Label className="flex items-center justify-between mb-3">
                  <span>Minimum Engagement Score</span>
                  <span className="text-muted-foreground">{minEngagementScore}+</span>
                </Label>
                <Slider
                  value={[minEngagementScore]}
                  onValueChange={([value]) => setMinEngagementScore(value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>All subscribers</span>
                  <span>Highly engaged only</span>
                </div>
              </div>

              {/* Matching Subscribers Preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Matching Subscribers</span>
                  <Badge variant="secondary" className="text-lg px-3">
                    {segmentedCount}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {segmentedCount === subscribers.length 
                    ? "All active subscribers match your criteria"
                    : `${((segmentedCount / subscribers.length) * 100).toFixed(1)}% of your subscribers`}
                </p>
              </div>

              {/* Email Content */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Email Content</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter email subject..."
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Write your targeted message..."
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={async () => {
                  if (!customSubject || !customMessage) {
                    toast({ title: "Please fill in subject and message", variant: "destructive" });
                    return;
                  }
                  
                  setSending(true);
                  try {
                    const { data, error } = await supabase.functions.invoke("send-segmented-email", {
                      body: {
                        segment: selectedSegment,
                        interests: selectedInterests,
                        minEngagementScore,
                        subject: customSubject,
                        content: customMessage,
                      },
                    });

                    if (error) throw error;

                    toast({
                      title: "Segmented email sent!",
                      description: data?.message || `Successfully sent to ${segmentedCount} subscribers.`,
                    });

                    setCustomSubject("");
                    setCustomMessage("");
                  } catch (error: any) {
                    toast({ title: "Failed to send", description: error.message, variant: "destructive" });
                  } finally {
                    setSending(false);
                  }
                }} 
                disabled={sending || segmentedCount === 0 || !customSubject || !customMessage} 
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {segmentedCount} Subscribers
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

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Email Performance
                </CardTitle>
                <CardDescription>Track your email campaign metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" /> Open Rate
                    </span>
                    <span className="text-muted-foreground">45.2%</span>
                  </div>
                  <Progress value={45.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4" /> Click Rate
                    </span>
                    <span className="text-muted-foreground">12.8%</span>
                  </div>
                  <Progress value={12.8} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Delivery Rate
                    </span>
                    <span className="text-muted-foreground">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriber Engagement</CardTitle>
                <CardDescription>How subscribers interact with your emails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Active Subscribers</p>
                      <p className="text-2xl font-bold">{subscribers.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                    <div>
                      <p className="font-medium text-blue-600 dark:text-blue-400">Emails Sent (30 days)</p>
                      <p className="text-2xl font-bold">{subscribers.length * 4}</p>
                    </div>
                    <Send className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                    <div>
                      <p className="font-medium text-purple-600 dark:text-purple-400">Avg. Opens per Email</p>
                      <p className="text-2xl font-bold">{Math.round(subscribers.length * 0.45)}</p>
                    </div>
                    <Eye className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailMarketing;
