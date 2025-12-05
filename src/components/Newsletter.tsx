import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const sendEmailNotification = async (subscriberEmail: string) => {
    try {
      await supabase.functions.invoke("notify-events", {
        body: {
          event_type: "newsletter",
          data: { email: subscriberEmail },
        },
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const trimmedEmail = email.trim().toLowerCase();
    
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: trimmedEmail });

    setIsLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed to our newsletter",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Send email notification to admin
    sendEmailNotification(trimmedEmail);

    setIsSubscribed(true);
    setEmail("");
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter",
    });
  };

  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
        <p className="text-muted-foreground">You've successfully subscribed to our newsletter.</p>
      </div>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {t("subscribeNewsletter")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("newsletterDescription")}
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t("enterEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="h-12 px-6 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t("subscribe")}
                </>
              )}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-4">
            {t("noSpam")}
          </p>
        </div>
      </div>
    </section>
  );
};
