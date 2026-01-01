import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Tag, Pin, Video, X } from "lucide-react";
import { Article } from "@/types/article";
import { useLanguage } from "@/contexts/LanguageContext";
import { PostEngagement } from "@/components/PostEngagement";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

interface NewsModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return null;
};

export const NewsModal = ({ article, isOpen, onClose }: NewsModalProps) => {
  const { t } = useLanguage();
  
  if (!article) return null;

  const youtubeUrl = article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <SEOHead 
          title={`${article.title} - Ajmal Akhtar Azad`}
          description={article.summary}
          image={article.image || undefined}
          url={`/news/${article.id}`}
          type="article"
        />
      )}
      <DialogContent className="glass-card w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-border p-0 sm:p-6">
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-50 sm:hidden bg-background/80 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="space-y-4 p-4 sm:p-0">
          {/* Video or Image */}
          {article.videoUrl ? (
            <div className="relative w-full rounded-lg overflow-hidden sm:-mx-6 sm:-mt-6 mb-2">
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
                <video 
                  controls 
                  className="w-full max-h-[50vh] sm:max-h-80"
                  playsInline
                  preload="metadata"
                >
                  <source src={article.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ) : article.image ? (
            <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden sm:-mx-6 sm:-mt-6 mb-2">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <time>{article.date}</time>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-semibold text-accent">{article.category}</span>
            </div>
            {article.isPinned && (
              <div className="flex items-center gap-1 sm:gap-2 text-accent">
                <Pin className="w-3 h-3 sm:w-4 sm:h-4 fill-accent" />
                <span className="font-semibold">{t("pinned")}</span>
              </div>
            )}
            {article.videoUrl && (
              <div className="flex items-center gap-1 sm:gap-2 text-blue-500">
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold">{t("video")}</span>
              </div>
            )}
          </div>

          <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {article.title}
          </DialogTitle>

          <DialogDescription className="text-sm sm:text-base md:text-lg text-muted-foreground italic">
            {article.summary}
          </DialogDescription>
        </DialogHeader>

        <div 
          className="mt-4 sm:mt-6 px-4 sm:px-0 prose prose-sm sm:prose-lg max-w-none 
            prose-headings:text-foreground prose-headings:text-base sm:prose-headings:text-lg
            prose-p:text-foreground/90 prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed
            prose-strong:text-foreground 
            prose-li:text-foreground/90 prose-li:text-sm sm:prose-li:text-base
            prose-img:rounded-lg prose-img:w-full
            [&>*]:break-words"
          dangerouslySetInnerHTML={{ __html: article.fullContent }}
        />

        {/* Engagement Section */}
        <div className="mt-6 sm:mt-8 px-4 sm:px-0 pb-4 sm:pb-0">
          <PostEngagement
            postId={String(article.id)}
            initialViews={article.views || 0}
            initialLikes={article.likesCount || 0}
            title={article.title}
            summary={article.summary}
            image={article.image}
            variant="full"
            showComments={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
