import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Tag, Pin, Video } from "lucide-react";
import { Article } from "@/types/article";

interface NewsModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};

export const NewsModal = ({ article, isOpen, onClose }: NewsModalProps) => {
  if (!article) return null;

  const youtubeUrl = article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-border">
        <DialogHeader className="space-y-4">
          {/* Video or Image */}
          {article.videoUrl ? (
            <div className="relative w-full rounded-lg overflow-hidden -mx-6 -mt-6 mb-2">
              {youtubeUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={youtubeUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video controls className="w-full max-h-80">
                  <source src={article.videoUrl} />
                </video>
              )}
            </div>
          ) : article.image ? (
            <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden -mx-6 -mt-6 mb-2">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time>{article.date}</time>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="font-semibold text-accent">{article.category}</span>
            </div>
            {article.isPinned && (
              <div className="flex items-center gap-2 text-accent">
                <Pin className="w-4 h-4 fill-accent" />
                <span className="font-semibold">Pinned</span>
              </div>
            )}
            {article.videoUrl && (
              <div className="flex items-center gap-2 text-blue-500">
                <Video className="w-4 h-4" />
                <span className="font-semibold">Video</span>
              </div>
            )}
          </div>

          <DialogTitle className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {article.title}
          </DialogTitle>

          <DialogDescription className="text-base sm:text-lg text-muted-foreground italic">
            {article.summary}
          </DialogDescription>
        </DialogHeader>

        <div 
          className="mt-6 prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90"
          dangerouslySetInnerHTML={{ __html: article.fullContent }}
        />
      </DialogContent>
    </Dialog>
  );
};
