import { useEffect } from "react";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

const News = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen pt-24">
      <SEOHead 
        title="News & Updates - Ajmal Akhtar Azad"
        description="Stay informed about our development initiatives and community programs."
        url="/news"
      />
      
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
                <span className="block text-foreground">{t("latestNews").split(" ")[0]?.toUpperCase() || "LATEST"}</span>
                <span className="block text-accent">{t("news").toUpperCase()} & UPDATES</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Stay informed about our development initiatives and community programs.
              </p>
            </motion.div>
          </div>
        </section>

        <NewsSection />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default News;
