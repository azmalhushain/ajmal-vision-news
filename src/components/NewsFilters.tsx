import { useEffect, useState } from "react";
import { Search, X, Rss } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NEWS_CATEGORIES = [
  "All",
  "Development",
  "Education",
  "Health",
  "Environment",
  "Infrastructure",
  "Events",
  "Announcements",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

interface NewsFiltersProps {
  category: NewsCategory;
  query: string;
  onCategoryChange: (c: NewsCategory) => void;
  onQueryChange: (q: string) => void;
  extraCategories?: string[];
}

export const NewsFilters = ({
  category,
  query,
  onCategoryChange,
  onQueryChange,
  extraCategories = [],
}: NewsFiltersProps) => {
  const [localQuery, setLocalQuery] = useState(query);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      if (localQuery !== query) onQueryChange(localQuery);
    }, 300);
    return () => clearTimeout(t);
  }, [localQuery]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const allCats = Array.from(
    new Set<string>([...NEWS_CATEGORIES, ...extraCategories]),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex flex-col gap-4">
        {/* Search + RSS */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search news, announcements, programs…"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="pl-10 pr-10 h-11 glass-card border-2"
              aria-label="Search news"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="glass-card glass-hover border-2 gap-2"
          >
            <a href="/rss.xml" target="_blank" rel="noopener" aria-label="RSS feed">
              <Rss className="h-4 w-4" />
              <span>RSS</span>
            </a>
          </Button>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {allCats.map((cat) => {
            const active = cat === category;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat as NewsCategory)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "glass-card border-border text-foreground hover:border-primary/60",
                )}
                aria-pressed={active}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
