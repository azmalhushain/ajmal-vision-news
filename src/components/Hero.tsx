import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Play } from "lucide-react";
import mayorImage from "@/assets/news-infrastructure.jpg";

export const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div
            className={cn(
              "space-y-8 transition-all duration-1000",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="block text-foreground">TOGETHER FOR</span>
              <span className="block text-accent animate-pulse">A PROSPEROUS</span>
              <span className="block text-foreground">BHOKRAHA NARSINGH</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Working hand-in-hand with citizens for development, dignity, and democracy.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="group bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-all duration-300 transform hover:scale-105"
              >
                Learn More
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 transform hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Watch Video
              </Button>
            </div>
          </div>

          {/* Visual Content */}
          <div
            className={cn(
              "relative transition-all duration-1000 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl group-hover:bg-accent/30 transition-all duration-500" />
              <img
                src={mayorImage}
                alt="Mayor Ajmal Akhtar Azad"
                className="relative rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl transform hover:scale-110 transition-transform duration-300 animate-delay-500 fade-in-up">
                <div className="text-4xl font-black text-accent">15+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  Projects Completed
                </div>
              </div>
              
              <div className="absolute -top-6 -left-6 glass-card p-6 rounded-2xl transform hover:scale-110 transition-transform duration-300 animate-delay-600 fade-in-up">
                <div className="text-4xl font-black text-accent">500+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  Families Benefited
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
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
