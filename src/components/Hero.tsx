import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Play } from "lucide-react";
import mayorImage from "@/assets/news-infrastructure.jpg";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    setIsVisible(true);
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("hero_content")
      .select("*")
      .limit(1)
      .single();
    
    if (data) setContent(data);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div
            className={cn(
              "space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-1000 text-center lg:text-left",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
              <span className="block text-foreground">{content?.title_line1 || "TOGETHER FOR"}</span>
              <span className="block text-accent animate-pulse">{content?.title_line2 || "A PROSPEROUS"}</span>
              <span className="block text-foreground">{content?.title_line3 || "BHOKRAHA NARSINGH"}</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {content?.description || "Working hand-in-hand with citizens for development, dignity, and democracy."}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="group bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                onClick={() => content?.button1_link && window.location.href !== content.button1_link && (window.location.href = content.button1_link)}
              >
                {content?.button1_text || "Learn More"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                onClick={() => content?.button2_link && window.location.href !== content.button2_link && (window.location.href = content.button2_link)}
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse" />
                {content?.button2_text || "Watch Video"}
              </Button>
            </div>
          </div>

          {/* Visual Content */}
          <div
            className={cn(
              "relative transition-all duration-1000 delay-300 order-first lg:order-last",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}
          >
            <div className="relative group max-w-md mx-auto lg:max-w-none">
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl group-hover:bg-accent/30 transition-all duration-500" />
              <img
                src={content?.hero_image_url || mayorImage}
                alt="Mayor Ajmal Akhtar Azad"
                loading="eager"
                className="relative rounded-3xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 w-full"
              />
              
              {/* Floating Stats */}
              <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 glass-card p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl transform hover:scale-110 transition-transform duration-300 animate-delay-500 fade-in-up">
                <div className="text-xl sm:text-2xl md:text-4xl font-black text-accent">{content?.stat1_number || "15+"}</div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                  {content?.stat1_label || "Projects Completed"}
                </div>
              </div>
              
              <div className="absolute -top-4 -left-2 sm:-top-6 sm:-left-6 glass-card p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl transform hover:scale-110 transition-transform duration-300 animate-delay-600 fade-in-up">
                <div className="text-xl sm:text-2xl md:text-4xl font-black text-accent">{content?.stat2_number || "500+"}</div>
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                  {content?.stat2_label || "Families Benefited"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden sm:flex">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ArrowDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
