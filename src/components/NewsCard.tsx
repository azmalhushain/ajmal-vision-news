import { Button } from "@/components/ui/button";
import { Calendar, Pin, Video, Heart, Eye } from "lucide-react";
import { Article } from "@/types/article";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";

interface NewsCardProps {
  article: Article;
  onClick: () => void;
}

export const NewsCard = ({ article, onClick }: NewsCardProps) => {
  const { t } = useLanguage();
  
  // Generate proper share URL with full domain
  const shareUrl = `/news#${article.id}`;
  const shareImage = article.image || "https://storage.googleapis.com/gpt-engineer-file-uploads/6j4N84GNxsXn52PqWIVTQd9p8RI2/social-images/social-1764428453124-image1.jpg";

  return (
    <article
      className="glass-card glass-hover rounded-xl sm:rounded-2xl overflow-hidden group h-full flex flex-col relative transition-all duration-300 w-full min-w-0"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      {/* Hidden SEO meta for this article */}
      <meta itemProp="headline" content={article.title} />
      <meta itemProp="description" content={article.summary} />
      <meta itemProp="image" content={shareImage} />
      <meta itemProp="datePublished" content={article.date} />
      <meta itemProp="author" content="Ajmal Akhtar Azad" />

      {/* Pinned indicator */}
      {article.isPinned && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
          <span className="glass-card px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-accent rounded-full flex items-center gap-1">
            <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-accent" />
            <span className="hidden xs:inline">{t("pinned")}</span>
          </span>
        </div>
      )}

      <div className="relative overflow-hidden cursor-pointer" onClick={onClick}>
        <div className="aspect-[16/9] sm:aspect-[4/3] md:aspect-[16/10] w-full bg-muted">
          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            loading="lazy"
            itemProp="image"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1 sm:gap-2 items-end max-w-[60%]">
          <span className="glass-card px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-foreground rounded-full truncate max-w-full">
            {article.category}
          </span>
          {article.videoUrl && (
            <span className="glass-card px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-blue-500 rounded-full flex items-center gap-1">
              <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Video</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-5 md:p-6 flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-2 text-muted-foreground text-[11px] sm:text-sm mb-2 sm:mb-3 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <time dateTime={article.date} itemProp="datePublished" className="truncate">{article.date}</time>
          </div>
          <ShareButtons
            url={shareUrl}
            title={article.title}
            description={article.summary}
            image={shareImage}
            variant="dropdown"
            size="sm"
            postId={String(article.id)}
          />
        </div>

        <h3
          className="text-sm sm:text-lg md:text-xl font-bold text-foreground mb-2 sm:mb-3 line-clamp-2 group-hover:text-accent transition-colors cursor-pointer leading-snug"
          onClick={onClick}
          itemProp="headline"
        >
          {article.title}
        </h3>

        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1" itemProp="description">
          {article.summary}
        </p>

        {/* Engagement Stats */}
        <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground text-[11px] sm:text-sm mb-3 sm:mb-4 border-t border-border pt-2 sm:pt-4">
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{article.likesCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{article.views || 0}</span>
          </div>
        </div>

        <Button
          onClick={onClick}
          variant="ghost"
          size="sm"
          className="w-full glass-card hover:bg-accent hover:text-accent-foreground font-semibold transition-all text-xs sm:text-base py-2 sm:py-2.5"
        >
          {article.videoUrl ? t("watchVideo") : t("readMore")}
        </Button>
      </div>
    </article>
  );
};

