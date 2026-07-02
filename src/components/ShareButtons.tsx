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
    whatsapp: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedShareUrl}`,
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

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const buttonSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`${buttonSize} rounded-full share-icon-btn hover:bg-accent/10 hover:text-accent`}
            aria-label="Share this article"
          >
            <Share2 className={iconSize} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-card border-border rounded-xl p-1.5">
          <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer rounded-lg gap-2 focus:bg-blue-600/10 focus:text-blue-600">
            <Facebook className="h-4 w-4 text-blue-600" /> Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer rounded-lg gap-2 focus:bg-sky-500/10 focus:text-sky-500">
            <Twitter className="h-4 w-4 text-sky-500" /> Twitter / X
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")} className="cursor-pointer rounded-lg gap-2 focus:bg-blue-700/10 focus:text-blue-700">
            <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="cursor-pointer rounded-lg gap-2 focus:bg-green-500/10 focus:text-green-500">
            <Send className="h-4 w-4 text-green-500" /> WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer rounded-lg gap-2">
            <Link2 className="h-4 w-4" /> Copy Link
          </DropdownMenuItem>
          {typeof navigator !== 'undefined' && navigator.share && (
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer rounded-lg gap-2">
              <Share2 className="h-4 w-4" /> More Options
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const socials: Array<{ key: keyof typeof shareLinks | "copy"; icon: JSX.Element; label: string; cls: string; onClick: () => void }> = [
    { key: "facebook", icon: <Facebook className={iconSize} />, label: "Share on Facebook", cls: "hover:bg-blue-600/15 hover:text-blue-500", onClick: () => handleShare("facebook") },
    { key: "twitter", icon: <Twitter className={iconSize} />, label: "Share on Twitter/X", cls: "hover:bg-sky-500/15 hover:text-sky-400", onClick: () => handleShare("twitter") },
    { key: "linkedin", icon: <Linkedin className={iconSize} />, label: "Share on LinkedIn", cls: "hover:bg-blue-700/15 hover:text-blue-500", onClick: () => handleShare("linkedin") },
    { key: "whatsapp", icon: <Send className={iconSize} />, label: "Share on WhatsApp", cls: "hover:bg-green-500/15 hover:text-green-400", onClick: () => handleShare("whatsapp") },
    { key: "copy", icon: <Link2 className={iconSize} />, label: "Copy link", cls: "hover:bg-accent/15 hover:text-accent", onClick: handleCopyLink },
  ];

  return (
    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
      <span className="text-xs sm:text-sm font-medium text-muted-foreground mr-0.5 sm:mr-1">Share:</span>
      {socials.map((s) => (
        <Button
          key={s.key}
          variant="ghost"
          size="icon"
          className={`${buttonSize} rounded-full share-icon-btn border border-border/50 bg-background/60 backdrop-blur ${s.cls}`}
          onClick={s.onClick}
          title={s.label}
          aria-label={s.label}
        >
          {s.icon}
        </Button>
      ))}
    </div>
  );
};

