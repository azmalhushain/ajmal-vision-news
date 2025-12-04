import { useState, useEffect, useCallback, useRef } from "react";
import { NewsCard } from "./NewsCard";
import { NewsModal } from "./NewsModal";
import { Button } from "@/components/ui/button";
import { Article } from "@/types/article";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 6;

export const NewsSection = ({ showAll = false }: { showAll?: boolean }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    fetchPosts(1, true);
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async (pageNum: number, reset = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const limit = showAll ? ITEMS_PER_PAGE : 6;
    const from = (pageNum - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) {
      const mappedArticles = data.map((post) => ({
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
      }));

      if (reset) {
        setArticles(mappedArticles);
      } else {
        setArticles((prev) => [...prev, ...mappedArticles]);
      }

      const totalLoaded = reset ? mappedArticles.length : articles.length + mappedArticles.length;
      setHasMore(count ? totalLoaded < count : false);
      setPage(pageNum);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!showAll || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchPosts(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [showAll, hasMore, isLoading, isLoadingMore, page]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-background via-background to-secondary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {!showAll && (
          <div className={`text-center mb-16 ${isVisible ? 'fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
              {t("latestNews")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay informed about our ongoing projects, initiatives, and community developments
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.map((article, index) => (
                <div
                  key={article.id}
                  className={`${isVisible ? 'fade-in-up' : 'opacity-0'} animate-delay-${Math.min((index + 1) * 100, 600)}`}
                >
                  <NewsCard
                    article={article}
                    onClick={() => setSelectedArticle(article)}
                  />
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger / Load more */}
            {showAll && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
                {!hasMore && articles.length > 0 && (
                  <p className="text-muted-foreground">No more posts to load</p>
                )}
              </div>
            )}

            {!showAll && (
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
            )}
          </>
        )}
      </div>

      <NewsModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </section>
  );
};
