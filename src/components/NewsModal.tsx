import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Tag, Pin, Video, X, Clock, Share2, Languages } from "lucide-react";
import { Article } from "@/types/article";
import { useLanguage, LANGUAGE_META } from "@/contexts/LanguageContext";
import { PostEngagement } from "@/components/PostEngagement";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Helmet } from "react-helmet-async";

interface NewsModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  return null;
};

const estimateReadMinutes = (text?: string) => {
  if (!text) return 2;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

const stripHtml = (html?: string) =>
  (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;

export const NewsModal = ({ article, isOpen, onClose }: NewsModalProps) => {
  const { t, language } = useLanguage();
  const { translatePost, isTranslating } = useTranslation();

  const [translated, setTranslated] = useState<{ title: string; content: string; excerpt?: string } | null>(null);

  useEffect(() => {
    setTranslated(null);
    if (!article || !isOpen) return;
    let cancelled = false;
    (async () => {
      // Force translation for every selected language (including English — source may be Nepali/other).
      const result = await translatePost(
        String(article.id),
        language,
        article.title,
        article.fullContent,
        article.summary,
        { force: true }
      );
      if (!cancelled) setTranslated(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [article, isOpen, language, translatePost]);

  if (!article) return null;

  const displayTitle = translated?.title || article.title;
  const displayContent = translated?.content || article.fullContent;
  const displaySummary = translated?.excerpt || article.summary;

  const youtubeUrl = article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : null;
  const readMin = estimateReadMinutes(displayContent || displaySummary);

  const seoDescription = useMemo(
    () => truncate(stripHtml(displaySummary) || stripHtml(displayContent), 155),
    [displaySummary, displayContent]
  );
  const seoTitle = useMemo(
    () => truncate(`${displayTitle} — Ajmal Akhtar Azad`, 60),
    [displayTitle]
  );
  const seoKeywords = useMemo(
    () =>
      [
        article.category,
        displayTitle,
        "Bhokraha Narsingh",
        "Ajmal Akhtar Azad",
        "news",
        LANGUAGE_META[language]?.label,
      ]
        .filter(Boolean)
        .join(", "),
    [article.category, displayTitle, language]
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <SEOHead
          title={seoTitle}
          description={seoDescription}
          image={article.image || undefined}
          imageAlt={`${displayTitle} — ${article.category}`}
          url={`/news/${article.id}`}
          type="article"
          category={article.category}
          keywords={seoKeywords}
          publishedTime={article.date ? new Date(article.date).toISOString() : undefined}
          modifiedTime={article.date ? new Date(article.date).toISOString() : undefined}
        />
      )}

      <DialogContent
        className="w-[100vw] sm:w-[95vw] max-w-3xl
          h-[100dvh] sm:h-auto sm:max-h-[92vh]
          p-0 gap-0 overflow-hidden
          border-0 sm:border sm:border-border/60
          rounded-none sm:rounded-3xl
          bg-card/95 backdrop-blur-xl
          shadow-[0_24px_80px_-20px_hsl(var(--foreground)/0.35)]
          flex flex-col"
      >
        {/* Sticky top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-2
          px-3 sm:px-5 py-2.5 sm:py-3
          bg-card/85 backdrop-blur-xl border-b border-border/60
          pt-[max(0.625rem,env(safe-area-inset-top))]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-9 w-9 p-0 hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate max-w-[60%]">
            {article.category}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (navigator.share) navigator.share({ title: displayTitle, text: seoDescription, url: window.location.href }).catch(() => {});
            }}
            className="rounded-full h-9 w-9 p-0 hover:bg-muted"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain flex-1 news-modal-safe-bottom">
          <DialogHeader className="space-y-0 text-left">
            {/* Hero media */}
            {article.videoUrl ? (
              <div className="relative w-full bg-black">
                {youtubeUrl ? (
                  <div className="aspect-video">
                    <iframe
                      src={youtubeUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={article.title}
                    />
                  </div>
                ) : (
                  <video controls className="w-full max-h-[55vh]" playsInline preload="metadata">
                    <source src={article.videoUrl} type="video/mp4" />
                  </video>
                )}
              </div>
            ) : article.image ? (
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
                <img
                  src={article.image}
                  alt={`${article.title} — ${article.category}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {article.isPinned && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full
                    text-[11px] font-semibold bg-accent text-accent-foreground flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-current" /> {t("pinned")}
                  </span>
                )}
              </div>
            ) : null}

            {/* Header content */}
            <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  bg-accent/10 text-accent font-semibold">
                  <Tag className="w-3 h-3" />
                  {article.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <time>{article.date}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {readMin} min read
                </span>
                {article.videoUrl && (
                  <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold">
                    <Video className="w-3.5 h-3.5" /> {t("video")}
                  </span>
                )}
                {isTranslating && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    <Languages className="w-3 h-3 animate-pulse" />
                    Translating to {LANGUAGE_META[language]?.native}…
                  </span>
                )}
                {!isTranslating && translated && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Languages className="w-3 h-3" />
                    {LANGUAGE_META[language]?.native}
                  </span>
                )}
              </div>

              <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-[1.15] tracking-tight">
                {displayTitle}
              </DialogTitle>

              <DialogDescription className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {displaySummary}
              </DialogDescription>

              {/* Author strip */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary
                  flex items-center justify-center text-sm font-bold text-accent-foreground">
                  AA
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-foreground">Ajmal Akhtar Azad</div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">Author · Bhokraha Narsingh</div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <article
            className="news-article-content news-modal-safe-x prose max-w-none px-4 sm:px-8 pb-6"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />

          <div className="px-4 sm:px-8 pb-8 news-modal-safe-x">
            <PostEngagement
              postId={String(article.id)}
              initialViews={article.views || 0}
              initialLikes={article.likesCount || 0}
              title={displayTitle}
              summary={displaySummary || ""}
              image={article.image}
              variant="full"
              showComments={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
