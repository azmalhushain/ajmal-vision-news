import { useEffect, useState } from "react";
import { Building2, Heart, GraduationCap, Users, Lightbulb, Leaf, Globe, Shield, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Heart,
  GraduationCap,
  Users,
  Lightbulb,
  Leaf,
  Globe,
  Shield,
};

interface Area {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export const DevelopmentAreas = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    fetchAreas();
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("development-areas");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const fetchAreas = async () => {
    const { data } = await supabase
      .from("development_areas")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    
    if (data) setAreas(data);
  };

  return (
    <section id="development-areas" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2
          className={`text-4xl lg:text-5xl font-black text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          Key Development Areas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {areas.map((area, index) => {
            const Icon = iconMap[area.icon_name] || Building2;
            return (
              <div
                key={area.id}
                className={`glass-card glass-hover p-8 rounded-2xl text-center group fade-in-up animate-delay-${
                  (index + 1) * 100
                }`}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6 group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-accent transition-colors">
                  {area.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
