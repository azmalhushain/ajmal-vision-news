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
      className="glass-card glass-hover rounded-2xl overflow-hidden group h-full flex flex-col relative transition-all duration-300"
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
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          <span className="glass-card px-2 py-1 text-xs font-semibold text-accent rounded-full flex items-center gap-1">
            <Pin className="w-3 h-3 fill-accent" />
            {t("pinned")}
          </span>
        </div>
      )}

      <div className="relative overflow-hidden cursor-pointer" onClick={onClick}>
        <div className="aspect-[16/10] sm:aspect-[4/3] md:aspect-[16/10] w-full">
          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            loading="lazy"
            itemProp="image"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
          <span className="glass-card px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-foreground rounded-full">
            {article.category}
          </span>
          {article.videoUrl && (
            <span className="glass-card px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-blue-500 rounded-full flex items-center gap-1">
              <Video className="w-3 h-3" />
              Video
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <time dateTime={article.date} itemProp="datePublished">{article.date}</time>
          </div>
          <ShareButtons
            url={shareUrl}
            title={article.title}
            description={article.summary}
            image={shareImage}
            variant="dropdown"
            size="sm"
          />
        </div>

        <h3 
          className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-2 sm:mb-3 line-clamp-2 group-hover:text-accent transition-colors cursor-pointer"
          onClick={onClick}
          itemProp="headline"
        >
          {article.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1" itemProp="description">
          {article.summary}
        </p>

        {/* Engagement Stats */}
        <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 border-t border-border pt-3 sm:pt-4">
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
          className="w-full glass-card hover:bg-accent hover:text-accent-foreground font-semibold transition-all text-sm sm:text-base py-2 sm:py-2.5"
        >
          {article.videoUrl ? t("watchVideo") : t("readMore")}
        </Button>
      </div>
    </article>
  );
};
