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
}

export const ShareButtons = ({
  url,
  title,
  description = "",
  variant = "inline",
  size = "md",
}: ShareButtonsProps) => {
  const { toast } = useToast();
  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({ title: "Link copied to clipboard!" });
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
        // User cancelled
      }
    }
  };

  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const buttonSize = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={buttonSize}>
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
          {navigator.share && (
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
      >
        <Facebook className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} hover:bg-sky-500/10 hover:text-sky-500`}
        onClick={() => handleShare("twitter")}
        title="Share on Twitter/X"
      >
        <Twitter className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} hover:bg-blue-700/10 hover:text-blue-700`}
        onClick={() => handleShare("linkedin")}
        title="Share on LinkedIn"
      >
        <Linkedin className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} hover:bg-green-500/10 hover:text-green-500`}
        onClick={() => handleShare("whatsapp")}
        title="Share on WhatsApp"
      >
        <Send className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={buttonSize}
        onClick={handleCopyLink}
        title="Copy Link"
      >
        <Link2 className={iconSize} />
      </Button>
    </div>
  );
};
