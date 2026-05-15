import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NewsSection } from "@/components/NewsSection";
import { NewsFilters, type NewsCategory } from "@/components/NewsFilters";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import ogNews from "@/assets/og-news.jpg";
import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const News = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<NewsCategory>(
    (searchParams.get("cat") as NewsCategory) || "All",
  );
  const [query, setQuery] = useState<string>(searchParams.get("q") || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync filter state -> URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (category && category !== "All") next.set("cat", category);
    else next.delete("cat");
    if (query) next.set("q", query);
    else next.delete("q");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query]);

  return (
    <PageTransition>
      <div className="min-h-screen pt-24">
        <SEOHead
          title="News & Updates — Mayor Ajmal Akhtar Azad"
          description="Latest news, announcements, and updates from Mayor Ajmal Akhtar Azad and Bhokraha Narsingh Municipality, Sunsari, Nepal."
          url="/news"
          image={ogNews}
          imageAlt="Stack of newspapers — News & Updates"
          keywords="Bhokraha Narsingh news, Mayor Ajmal Akhtar Azad updates, Sunsari news, municipal announcements, Nepal local government"
          type="website"
        />
        <Helmet>
          <link
            rel="alternate"
            type="application/rss+xml"
            title="Ajmal Akhtar Azad — News RSS"
            href="/rss.xml"
          />
        </Helmet>

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
                <span className="block text-foreground">
                  {t("latestNews").split(" ")[0]?.toUpperCase() || "LATEST"}
                </span>
                <span className="block text-accent">{t("news").toUpperCase()} & UPDATES</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Stay informed about our development initiatives and community programs.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="pt-8">
          <NewsFilters
            category={category}
            query={query}
            onCategoryChange={setCategory}
            onQueryChange={setQuery}
          />
        </div>

        <NewsSection showAll category={category} query={query} />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default News;
