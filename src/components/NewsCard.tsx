import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Article } from "@/types/article";

interface NewsCardProps {
  article: Article;
  onClick: () => void;
}

export const NewsCard = ({ article, onClick }: NewsCardProps) => {
  return (
    <article className="glass-card glass-hover rounded-2xl overflow-hidden cursor-pointer group h-full flex flex-col">
      <div className="relative overflow-hidden h-56">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <span className="glass-card px-3 py-1 text-xs font-semibold text-foreground rounded-full">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <time>{article.date}</time>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
          {article.summary}
        </p>

        <Button
          onClick={onClick}
          variant="ghost"
          className="w-full glass-card hover:bg-accent hover:text-accent-foreground font-semibold transition-all"
        >
          Read More
        </Button>
      </div>
    </article>
  );
};
