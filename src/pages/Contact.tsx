import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageTransition } from "@/components/PageTransition";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [content, setContent] = useState({
    hero_title_line1: "GET IN",
    hero_title_line2: "TOUCH",
    hero_description: "",
    office_address: "",
    phone_numbers: "",
    email_addresses: "",
    office_hours: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("contact_content")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setContent({
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save message to database
      const { error: dbError } = await supabase.from("contact_messages").insert({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
      });

      if (dbError) throw dbError;

      // Send email notification
      await supabase.functions.invoke("notify-events", {
        body: {
          event_type: "contact",
          data: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
          },
        },
      });

      toast({
        title: t("messageSent"),
        description: t("messageSentDesc"),
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t("officeAddress"),
      details: content.office_address,
    },
    {
      icon: Phone,
      title: t("phone"),
      details: content.phone_numbers,
    },
    {
      icon: Mail,
      title: t("email"),
      details: content.email_addresses,
    },
    {
      icon: Clock,
      title: t("officeHours"),
      details: content.office_hours,
    },
  ];

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-5xl lg:text-7xl font-black mb-6">
                <span className="block text-foreground">{t("getIn")}</span>
                <span className="block text-accent">{t("touch")}</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {content.hero_description || t("contactDescription")}
              </p>
            </motion.div>
          </div>
        </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.title}
                  className={`glass-card glass-hover p-8 rounded-2xl text-center fade-in-up animate-delay-${
                    (index + 1) * 100
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground">{info.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                    {info.details}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 lg:p-12 rounded-2xl fade-in-up animate-delay-500">
              <h2 className="text-3xl font-black mb-8 text-center">{t("sendUsMessage")}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      {t("firstName")}
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="glass-card border-border focus:border-accent"
                      placeholder={t("enterFirstName")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      {t("lastName")}
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="glass-card border-border focus:border-accent"
                      placeholder={t("enterLastName")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    {t("email")}
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-card border-border focus:border-accent"
                    placeholder={t("enterEmail")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    {t("phone")}
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="glass-card border-border focus:border-accent"
                    placeholder={t("enterPhone")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    {t("message")}
                  </label>
                  <Textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="glass-card border-border focus:border-accent resize-none"
                    placeholder={t("writeMessage")}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold transition-all duration-300 transform hover:scale-105"
                >
                  {submitting ? "Sending..." : t("sendMessage")}
                </Button>
              </form>
            </div>
          </div>
        </div>
        </section>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Contact;
