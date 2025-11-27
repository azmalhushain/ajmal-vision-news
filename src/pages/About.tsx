import { useEffect, useState } from "react";
import { Handshake, Users, Lightbulb, Heart, Leaf, Star, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

const iconMap: Record<string, LucideIcon> = {
  Handshake,
  Users,
  Lightbulb,
  Heart,
  Leaf,
  Star,
};

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface Achievement {
  number: string;
  title: string;
  description: string;
}

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    hero_title_line1: "MEET",
    hero_title_line2: "AJMAL AKHTAR AZAD",
    hero_description: "",
    bio_title: "The Journey",
    bio_content: "",
    bio_image_url: "",
  });
  const [values, setValues] = useState<Value[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("about_content")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setContent({
        hero_title_line1: data.hero_title_line1,
        hero_title_line2: data.hero_title_line2,
        hero_description: data.hero_description,
        bio_title: data.bio_title,
        bio_content: data.bio_content,
        bio_image_url: data.bio_image_url || "",
      });
      setValues(data.values_json as unknown as Value[]);
      setAchievements(data.achievements_json as unknown as Achievement[]);
    }
    setLoading(false);
  };

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

      {/* Biography Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-in-up">
              <h2 className="text-4xl font-black text-foreground">{content.bio_title}</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {content.bio_content.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            {content.bio_image_url && (
              <div className="relative group fade-in-up animate-delay-300">
                <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl group-hover:bg-accent/30 transition-all duration-500" />
                <img
                  src={content.bio_image_url}
                  alt="Biography"
                  className="relative rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      {values.length > 0 && (
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl lg:text-5xl font-black text-center mb-16">
              Mission & Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = iconMap[value.icon] || Star;
                return (
                  <div
                    key={value.title}
                    className={`glass-card glass-hover p-8 rounded-2xl fade-in-up animate-delay-${(index + 1) * 100}`}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                      <Icon className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl lg:text-5xl font-black text-center mb-16">
              Key Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.title}
                  className={`glass-card glass-hover p-8 rounded-2xl text-center fade-in-up animate-delay-${(index + 1) * 100}`}
                >
                  <div className="text-5xl font-black text-accent mb-4">{achievement.number}</div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default About;
