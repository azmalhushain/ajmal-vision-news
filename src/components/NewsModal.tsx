import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Tag } from "lucide-react";
import { Article } from "@/types/article";

interface NewsModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NewsModal = ({ article, isOpen, onClose }: NewsModalProps) => {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-border">
        <DialogHeader className="space-y-4">
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden -mx-6 -mt-6 mb-2">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time>{article.date}</time>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="font-semibold text-accent">{article.category}</span>
            </div>
          </div>

          <DialogTitle className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {article.title}
          </DialogTitle>

          <DialogDescription className="text-base sm:text-lg text-muted-foreground italic">
            {article.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 prose prose-invert prose-lg max-w-none">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
            {article.fullContent}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
