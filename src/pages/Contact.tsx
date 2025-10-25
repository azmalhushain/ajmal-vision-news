import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

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
      details: "Bhokraha Narsingh Municipality\nSunsari District, Province No. 1, Nepal",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+977-XXX-XXXXXX\n+977-XXX-XXXXXX",
    },
    {
      icon: Mail,
      title: "Email",
      details: "info@bhokrahanarsingh.gov.np\nmayor@bhokrahanarsingh.gov.np",
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: "Sunday - Friday: 10:00 AM - 5:00 PM\nSaturday: Closed",
    },
  ];

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
              <span className="block text-foreground">GET IN</span>
              <span className="block text-accent">TOUCH</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Have questions or suggestions? We'd love to hear from you.
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
