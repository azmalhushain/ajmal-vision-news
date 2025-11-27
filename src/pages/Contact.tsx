import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    setIsVisible(true);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Office Address",
      details: content.office_address,
    },
    {
      icon: Phone,
      title: "Phone",
      details: content.phone_numbers,
    },
    {
      icon: Mail,
      title: "Email",
      details: content.email_addresses,
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: content.office_hours,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="block text-foreground">{content.hero_title_line1}</span>
              <span className="block text-accent">{content.hero_title_line2}</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {content.hero_description}
            </p>
          </div>
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
              <h2 className="text-3xl font-black mb-8 text-center">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      First Name
                    </label>
                    <Input
                      type="text"
                      required
                      className="glass-card border-border focus:border-accent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      required
                      className="glass-card border-border focus:border-accent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    required
                    className="glass-card border-border focus:border-accent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    className="glass-card border-border focus:border-accent"
                    placeholder="+977-XXX-XXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Message
                  </label>
                  <Textarea
                    required
                    rows={6}
                    className="glass-card border-border focus:border-accent resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
