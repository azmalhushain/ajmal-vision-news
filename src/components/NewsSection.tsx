import { useState, useEffect } from "react";
import { NewsCard } from "./NewsCard";
import { NewsModal } from "./NewsModal";
import { Button } from "@/components/ui/button";
import { Article } from "@/types/article";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export const NewsSection = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    fetchPosts();
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) {
      setArticles(
        data.map((post) => ({
          id: post.id,
          title: post.title,
          date: new Date(post.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          summary: post.excerpt || "",
          image: post.image_url || "",
          fullContent: post.content,
          category: post.category || "News",
          videoUrl: post.video_url,
          isPinned: post.is_pinned || false,
          views: post.views || 0,
          likesCount: post.likes_count || 0,
        }))
      );
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-background via-background to-secondary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 ${isVisible ? 'fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
            {t("latestNews")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay informed about our ongoing projects, initiatives, and community developments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className={`${isVisible ? 'fade-in-up' : 'opacity-0'} animate-delay-${(index + 1) * 100}`}
            >
              <NewsCard
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            </div>
          ))}
        </div>

        <div className={`text-center ${isVisible ? 'fade-in-up animate-delay-600' : 'opacity-0'}`}>
          <Link to="/news">
            <Button
              variant="outline"
              size="lg"
              className="glass-card glass-hover text-foreground font-semibold px-8 py-6 text-lg border-2"
            >
              View All {t("news")}
            </Button>
          </Link>
        </div>
      </div>

      <NewsModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </section>
  );
};
