import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, Mic, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResult {
  id: string;
  title: string;
  type: "post" | "podcast" | "gallery";
  description?: string;
  image?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search posts
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, excerpt, image_url")
        .eq("status", "published")
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(5);

      if (posts) {
        searchResults.push(
          ...posts.map((post) => ({
            id: post.id,
            title: post.title,
            type: "post" as const,
            description: post.excerpt || undefined,
            image: post.image_url || undefined,
          }))
        );
      }

      // Search podcasts
      const { data: podcasts } = await supabase
        .from("podcasts")
        .select("id, title, description, cover_image_url")
        .eq("is_active", true)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(5);

      if (podcasts) {
        searchResults.push(
          ...podcasts.map((podcast) => ({
            id: podcast.id,
            title: podcast.title,
            type: "podcast" as const,
            description: podcast.description || undefined,
            image: podcast.cover_image_url || undefined,
          }))
        );
      }

      // Search gallery
      const { data: gallery } = await supabase
        .from("gallery_images")
        .select("id, title, image_url, category")
        .eq("is_active", true)
        .or(`title.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      if (gallery) {
        searchResults.push(
          ...gallery.map((img) => ({
            id: img.id,
            title: img.title,
            type: "gallery" as const,
            description: img.category,
            image: img.image_url,
          }))
        );
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    }

    setIsLoading(false);
  };

  const handleResultClick = (result: SearchResult) => {
    onClose();
    setQuery("");
    
    if (result.type === "post") {
      navigate("/news", { state: { openPostId: result.id } });
    } else if (result.type === "podcast") {
      navigate("/podcasts", { state: { openPodcastId: result.id } });
    } else {
      navigate("/gallery");
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "post":
        return <FileText className="h-4 w-4" />;
      case "podcast":
        return <Mic className="h-4 w-4" />;
      case "gallery":
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "post":
        return t("news");
      case "podcast":
        return t("podcasts");
      case "gallery":
        return t("gallery");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 glass-card border-border overflow-hidden">
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg py-6"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-accent/10 transition-colors text-left"
                >
                  {result.image ? (
                    <img
                      src={result.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {getIcon(result.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {result.title}
                    </p>
                    {result.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {result.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                    {getTypeLabel(result.type)}
                  </span>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center text-muted-foreground">
              {t("noResults")}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {t("searchHint")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
