import { Facebook, Twitter, Linkedin, Send, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: "inline" | "dropdown";
  size?: "sm" | "md" | "lg";
  postId?: string;
}

export const ShareButtons = ({
  url,
  title,
  description = "",
  image = "",
  variant = "inline",
  size = "md",
  postId,
}: ShareButtonsProps) => {
  const { toast } = useToast();
  const siteUrl = "https://ajmal-vision-news.lovable.app";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kpswxkuzfnafsqeqaunt.supabase.co";
  
  // Use og-image edge function for social sharing to get proper OG meta tags
  const getShareUrl = () => {
    if (postId) {
      return `${supabaseUrl}/functions/v1/og-image?post=${postId}`;
    }
    // For pages, use the direct URL
    return url.startsWith("http") ? url : `${siteUrl}${url}`;
  };
  
  const shareUrl = getShareUrl();
  const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // Build share links with proper OG meta tag URL for crawlers
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}&via=AjmalAkhtarAzad`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedShareUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodeURIComponent(fullUrl)}`,
    telegram: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedTitle}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=500,noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({ title: "Link copied!", description: "Share it with anyone." });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const buttonSize = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={buttonSize} aria-label="Share this article">
            <Share2 className={iconSize} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-border">
          <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer">
            <Twitter className="h-4 w-4 mr-2 text-sky-500" />
            Twitter/X
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")} className="cursor-pointer">
            <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="cursor-pointer">
            <Send className="h-4 w-4 mr-2 text-green-500" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          {typeof navigator !== 'undefined' && navigator.share && (
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
              <Share2 className="h-4 w-4 mr-2" />
              More Options
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} hover:bg-blue-600/10 hover:text-blue-600`}
        onClick={() => handleShare("facebook")}
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <Facebook className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} hover:bg-sky-500/10 hover:text-sky-500`}
        onClick={() => handleShare("twitter")}
        title="Share on Twitter/X"
        aria-label="Share on Twitter"
      >
        <Twitter className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} hover:bg-blue-700/10 hover:text-blue-700`}
        onClick={() => handleShare("linkedin")}
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} hover:bg-green-500/10 hover:text-green-500`}
        onClick={() => handleShare("whatsapp")}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <Send className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={buttonSize}
        onClick={handleCopyLink}
        title="Copy Link"
        aria-label="Copy link to clipboard"
      >
        <Link2 className={iconSize} />
      </Button>
    </div>
  );
};
