import { Button } from "@/components/ui/button";
import { Calendar, Pin, Video, Heart, Eye, Clock, ArrowUpRight } from "lucide-react";
import { Article } from "@/types/article";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShareButtons } from "@/components/ShareButtons";

interface NewsCardProps {
  article: Article;
  onClick: () => void;
}

const estimateReadMinutes = (text?: string) => {
  if (!text) return 2;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

export const NewsCard = ({ article, onClick }: NewsCardProps) => {
  const { t } = useLanguage();

  const shareUrl = `/news#${article.id}`;
  const shareImage =
    article.image ||
    "https://storage.googleapis.com/gpt-engineer-file-uploads/6j4N84GNxsXn52PqWIVTQd9p8RI2/social-images/social-1764428453124-image1.jpg";
  const readMin = estimateReadMinutes(article.fullContent || article.summary);

  return (
    <article
      className="group relative h-full w-full min-w-0 max-w-full flex flex-col rounded-2xl sm:rounded-3xl
        bg-card/80 backdrop-blur-xl border border-border/60
        shadow-[0_4px_24px_-12px_hsl(var(--foreground)/0.18)]
        hover:shadow-[0_18px_44px_-18px_hsl(var(--accent)/0.45)]
        hover:border-accent/40 hover:-translate-y-1
        transition-all duration-500 ease-out overflow-hidden p-1.5 xs:p-2 sm:p-3"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >

      <meta itemProp="headline" content={article.title} />
      <meta itemProp="description" content={article.summary} />
      <meta itemProp="image" content={shareImage} />
      <meta itemProp="datePublished" content={article.date} />
      <meta itemProp="author" content="Ajmal Akhtar Azad" />

      {/* Media */}
      <div
        className="relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer"
        onClick={onClick}
      >
        <div className="aspect-[16/10] w-full bg-muted">
          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            loading="lazy"
            itemProp="image"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        </div>

        {/* gradient veil */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {/* top-left chips */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 max-w-[70%]">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold
            bg-background/85 backdrop-blur-md text-foreground border border-border/60 truncate">
            {article.category}
          </span>
          {article.isPinned && (
            <span className="px-2 py-1 rounded-full text-[10px] font-semibold
              bg-accent/95 text-accent-foreground flex items-center gap-1">
              <Pin className="w-3 h-3 fill-current" />
              <span className="hidden xs:inline">{t("pinned")}</span>
            </span>
          )}
        </div>

        {/* video badge */}
        {article.videoUrl && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold
              bg-red-500/95 text-white flex items-center gap-1 shadow-lg">
              <Video className="w-3 h-3" />
              Video
            </span>
          </div>
        )}

        {/* read time pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full
          bg-background/85 backdrop-blur-md text-[10px] sm:text-[11px] font-medium text-foreground border border-border/60">
          <Clock className="w-3 h-3" />
          {readMin} min read
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-2 pt-3 sm:px-3 sm:pt-4 pb-2 sm:pb-3 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 text-muted-foreground min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-accent to-primary
              flex items-center justify-center text-[10px] sm:text-xs font-bold text-accent-foreground shrink-0">
              AA
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
                Ajmal Akhtar
              </span>
              <time
                dateTime={article.date}
                itemProp="datePublished"
                className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1"
              >
                <Calendar className="w-2.5 h-2.5" />
                <span className="truncate">{article.date}</span>
              </time>
            </div>
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
          onClick={onClick}
          itemProp="headline"
          className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-snug
            mb-2 line-clamp-2 cursor-pointer group-hover:text-accent transition-colors"
        >
          {article.title}
        </h3>

        <p
          className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 flex-1"
          itemProp="description"
        >
          {article.summary}
        </p>

        {/* Footer */}
        <div className="mt-3 sm:mt-4 pt-3 flex items-center justify-between gap-2 border-t border-border/60">
          <div className="flex items-center gap-3 text-muted-foreground text-[11px] sm:text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {article.likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views || 0}
            </span>
          </div>
          <Button
            onClick={onClick}
            size="sm"
            className="h-8 sm:h-9 rounded-full px-3 sm:px-4 text-[11px] sm:text-xs font-semibold
              bg-foreground text-background hover:bg-accent hover:text-accent-foreground
              transition-all group/btn"
          >
            {article.videoUrl ? t("watchVideo") : t("readMore")}
            <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Button>
        </div>
      </div>
    </article>
  );
};
