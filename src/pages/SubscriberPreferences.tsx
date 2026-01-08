import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Mail, Bell, Clock, Check, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";

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

interface Preferences {
  email_frequency: string;
  preferred_time: string;
  receive_breaking_news: boolean;
  receive_weekly_digest: boolean;
  receive_event_notifications: boolean;
  receive_promotional: boolean;
  interests: string[];
}

const SubscriberPreferences = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscriber, setSubscriber] = useState<any>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    email_frequency: "weekly",
    preferred_time: "morning",
    receive_breaking_news: true,
    receive_weekly_digest: true,
    receive_event_notifications: true,
    receive_promotional: false,
    interests: [],
  });

  useEffect(() => {
    if (email) {
      fetchSubscriberData();
    } else {
      setLoading(false);
    }
  }, [email]);

  const fetchSubscriberData = async () => {
    try {
      // Fetch subscriber by email
      const { data: sub, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !sub) {
        toast({ title: "Subscriber not found", variant: "destructive" });
        return;
      }

      setSubscriber(sub);
      setPreferences(prev => ({
        ...prev,
        interests: sub.interests || [],
      }));

      // Fetch preferences if they exist
      const { data: prefs } = await supabase
        .from("subscriber_preferences")
        .select("*")
        .eq("subscriber_id", sub.id)
        .single();

      if (prefs) {
        setPreferences({
          email_frequency: prefs.email_frequency || "weekly",
          preferred_time: prefs.preferred_time || "morning",
          receive_breaking_news: prefs.receive_breaking_news ?? true,
          receive_weekly_digest: prefs.receive_weekly_digest ?? true,
          receive_event_notifications: prefs.receive_event_notifications ?? true,
          receive_promotional: prefs.receive_promotional ?? false,
          interests: sub.interests || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!subscriber) return;
    
    setSaving(true);
    try {
      // Update interests in newsletter_subscribers
      await supabase
        .from("newsletter_subscribers")
        .update({ interests: preferences.interests })
        .eq("id", subscriber.id);

      // Upsert preferences
      await supabase
        .from("subscriber_preferences")
        .upsert({
          subscriber_id: subscriber.id,
          email_frequency: preferences.email_frequency,
          preferred_time: preferences.preferred_time,
          receive_breaking_news: preferences.receive_breaking_news,
          receive_weekly_digest: preferences.receive_weekly_digest,
          receive_event_notifications: preferences.receive_event_notifications,
          receive_promotional: preferences.receive_promotional,
        }, { onConflict: "subscriber_id" });

      toast({ title: "Preferences saved!", description: "Your newsletter preferences have been updated." });
    } catch (err: any) {
      toast({ title: "Error saving preferences", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen pt-24">
        <SEOHead 
          title="Newsletter Preferences - Ajmal Akhtar Azad"
          description="Manage your newsletter subscription preferences"
          url="/preferences"
        />
        <div className="container mx-auto px-4 py-20 text-center">
          <Settings className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Manage Your Preferences</h1>
          <p className="text-muted-foreground mb-8">
            Please use the link from your email to access your preferences page.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-background to-secondary/20">
      <SEOHead 
        title="Newsletter Preferences - Ajmal Akhtar Azad"
        description="Manage your newsletter subscription preferences"
        url="/preferences"
      />
      
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Settings className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Newsletter Preferences</h1>
            <p className="text-muted-foreground">
              Customize what you receive from us, <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-6">
            {/* Topics of Interest */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Topics of Interest
                </CardTitle>
                <CardDescription>Select the topics you want to hear about</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={preferences.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-all text-sm py-2 px-3"
                      onClick={() => toggleInterest(interest)}
                    >
                      {preferences.interests.includes(interest) && (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Frequency
                </CardTitle>
                <CardDescription>How often do you want to hear from us?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={preferences.email_frequency}
                  onValueChange={(v) => setPreferences(prev => ({ ...prev, email_frequency: v }))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="flex-1 cursor-pointer">
                      <span className="font-medium">Daily Digest</span>
                      <p className="text-sm text-muted-foreground">Get updates every day</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                      <span className="font-medium">Weekly Summary</span>
                      <p className="text-sm text-muted-foreground">Get a weekly roundup of news</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <span className="font-medium">Monthly Newsletter</span>
                      <p className="text-sm text-muted-foreground">Get important updates monthly</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Preferred Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Preferred Time
                </CardTitle>
                <CardDescription>When do you prefer to receive emails?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={preferences.preferred_time}
                  onValueChange={(v) => setPreferences(prev => ({ ...prev, preferred_time: v }))}
                  className="grid grid-cols-3 gap-3"
                >
                  <div className="flex flex-col items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="morning" id="morning" className="mb-2" />
                    <Label htmlFor="morning" className="cursor-pointer text-center">
                      <span className="text-lg">🌅</span>
                      <p className="text-sm font-medium">Morning</p>
                    </Label>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="afternoon" id="afternoon" className="mb-2" />
                    <Label htmlFor="afternoon" className="cursor-pointer text-center">
                      <span className="text-lg">☀️</span>
                      <p className="text-sm font-medium">Afternoon</p>
                    </Label>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="evening" id="evening" className="mb-2" />
                    <Label htmlFor="evening" className="cursor-pointer text-center">
                      <span className="text-lg">🌙</span>
                      <p className="text-sm font-medium">Evening</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
                <CardDescription>Choose what types of emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label className="font-medium">Breaking News</Label>
                    <p className="text-sm text-muted-foreground">Important updates and announcements</p>
                  </div>
                  <Checkbox
                    checked={preferences.receive_breaking_news}
                    onCheckedChange={(c) => setPreferences(prev => ({ ...prev, receive_breaking_news: !!c }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label className="font-medium">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Summary of the week's news</p>
                  </div>
                  <Checkbox
                    checked={preferences.receive_weekly_digest}
                    onCheckedChange={(c) => setPreferences(prev => ({ ...prev, receive_weekly_digest: !!c }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label className="font-medium">Event Notifications</Label>
                    <p className="text-sm text-muted-foreground">Upcoming events and programs</p>
                  </div>
                  <Checkbox
                    checked={preferences.receive_event_notifications}
                    onCheckedChange={(c) => setPreferences(prev => ({ ...prev, receive_event_notifications: !!c }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label className="font-medium">Promotional Content</Label>
                    <p className="text-sm text-muted-foreground">Special offers and partnerships</p>
                  </div>
                  <Checkbox
                    checked={preferences.receive_promotional}
                    onCheckedChange={(c) => setPreferences(prev => ({ ...prev, receive_promotional: !!c }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              You can update these preferences at any time by clicking the link in any of our emails.
            </p>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SubscriberPreferences;