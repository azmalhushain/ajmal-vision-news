import { useEffect, useState } from "react";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";

const News = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

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
              <span className="block text-foreground">LATEST</span>
              <span className="block text-accent">NEWS & UPDATES</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay informed about our development initiatives and community programs.
            </p>
          </div>
        </div>
      </section>

      <NewsSection />
      <Footer />
    </div>
  );
};

export default News;
