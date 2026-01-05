import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TranslationCache {
  [key: string]: {
    title: string;
    content: string;
    excerpt?: string;
  };
}

export const useTranslation = () => {
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const translatePost = useCallback(async (
    postId: string,
    targetLanguage: string,
    originalTitle: string,
    originalContent: string,
    originalExcerpt?: string
  ) => {
    // Return original if target is English
    if (targetLanguage === "en") {
      return {
        title: originalTitle,
        content: originalContent,
        excerpt: originalExcerpt,
      };
    }

    // Check cache first
    const cacheKey = `${postId}-${targetLanguage}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    setIsTranslating(true);

    try {
      const { data, error } = await supabase.functions.invoke("translate-post", {
        body: {
          postId,
          targetLanguage,
          title: originalTitle,
          content: originalContent,
          excerpt: originalExcerpt,
        },
      });

      if (error) throw error;

      const translation = {
        title: data.translated_title || originalTitle,
        content: data.translated_content || originalContent,
        excerpt: data.translated_excerpt || originalExcerpt,
      };

      // Update cache
      setTranslationCache((prev) => ({
        ...prev,
        [cacheKey]: translation,
      }));

      return translation;
    } catch (error: any) {
      console.error("Translation error:", error);
      
      // Don't show toast for rate limits - just use original
      if (error.message?.includes("Rate limit") || error.message?.includes("402")) {
        toast({
          title: "Translation unavailable",
          description: "Showing original content.",
          variant: "default",
        });
      }

      // Return original content on error
      return {
        title: originalTitle,
        content: originalContent,
        excerpt: originalExcerpt,
      };
    } finally {
      setIsTranslating(false);
    }
  }, [translationCache, toast]);

  const clearCache = useCallback(() => {
    setTranslationCache({});
  }, []);

  return {
    translatePost,
    isTranslating,
    clearCache,
  };
};
