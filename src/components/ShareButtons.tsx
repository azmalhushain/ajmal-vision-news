import { useState } from "react";
import { Facebook, Twitter, Linkedin, Send, Link2, Share2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { toAbsoluteUrl, trackShare, type SharePlatform } from "@/lib/share";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: "inline" | "dropdown";
  size?: "sm" | "md" | "lg";
  postId?: string;
  /** For analytics: post | gallery | podcast | player ... */
  contentType?: string;
  contentId?: string;
}

type Platform = SharePlatform;

export const ShareButtons = ({
  url,
  title,
  description = "",
  image = "",
  variant = "inline",
  size = "md",
  postId,
  contentType = postId ? "post" : "page",
  contentId,
}: ShareButtonsProps) => {
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kpswxkuzfnafsqeqaunt.supabase.co";

  // Canonical, absolute link to the exact content (always same-origin as the visitor).
  const fullUrl = toAbsoluteUrl(url);

  // Crawler-friendly proxy that serves per-post OG tags then redirects to the post.
  const shareUrl = postId
    ? `${supabaseUrl}/functions/v1/og-image?post=${encodeURIComponent(postId)}`
    : fullUrl;

  const analyticsId = contentId ?? postId ?? null;

  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const whatsappText = encodeURIComponent(
    [title, description, shareUrl].filter(Boolean).join("\n\n"),
  );

  const shareLinks: Record<Exclude<Platform, "copy" | "native">, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}&via=AjmalAkhtarAzad`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${whatsappText}`,
    telegram: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedTitle}`,
  };

  const logShare = (platform: Platform | "sheet", action: "share_open" | "share_click") =>
    trackShare({ platform, action, contentType, contentId: analyticsId, shareUrl });

  const openShare = (platform: Exclude<Platform, "copy" | "native">) => {
    logShare(platform, "share_click");
    window.open(shareLinks[platform], "_blank", "width=600,height=500,noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    logShare("copy", "share_click");
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share it with anyone." });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    logShare("native", "share_click");
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: fullUrl });
      } catch {
        /* cancelled */
      }
    }
  };

  const isMobile = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

  const openSheet = (from: Platform | "sheet" = "sheet") => {
    logShare(from, "share_open");
    setSheetOpen(true);
  };

  const handleAction = (p: Platform) => {
    if (p === "copy") return handleCopyLink();
    if (p === "native") return handleNativeShare();
    openShare(p);
    setSheetOpen(false);
  };


  // Any icon click on mobile opens the sheet preview
  const handleIconClick = (p: Platform) => {
    if (isMobile()) {
      openSheet(p);
    } else {
      handleAction(p);
    }
  };

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const buttonSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";

  const platforms: Array<{ key: Platform; icon: JSX.Element; label: string; color: string; ring: string }> = [
    { key: "facebook", icon: <Facebook className="h-4 w-4" />, label: "Facebook", color: "bg-blue-600 text-white", ring: "hover:ring-blue-500/50" },
    { key: "twitter", icon: <Twitter className="h-4 w-4" />, label: "Twitter / X", color: "bg-sky-500 text-white", ring: "hover:ring-sky-400/50" },
    { key: "linkedin", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn", color: "bg-blue-700 text-white", ring: "hover:ring-blue-500/50" },
    { key: "whatsapp", icon: <Send className="h-4 w-4" />, label: "WhatsApp", color: "bg-green-500 text-white", ring: "hover:ring-green-400/50" },
    { key: "telegram", icon: <Send className="h-4 w-4 -rotate-45" />, label: "Telegram", color: "bg-sky-600 text-white", ring: "hover:ring-sky-400/50" },
    { key: "copy", icon: copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />, label: copied ? "Copied" : "Copy link", color: "bg-muted text-foreground", ring: "hover:ring-accent/50" },
  ];

  // Preview sheet content (mobile animated share card)
  const previewSheet = (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-[1.75rem] border-t border-border/60 bg-card/95 backdrop-blur-2xl p-0
          max-h-[88vh] overflow-y-auto news-modal-safe-bottom
          shadow-[0_-20px_60px_-25px_hsl(var(--foreground)/0.55)]
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
          data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:slide-out-to-bottom-8
          data-[state=open]:duration-300 data-[state=closed]:duration-200
          ease-out"
      >
        <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        <SheetHeader className="px-5 pt-2 pb-3 text-left">
          <SheetTitle className="text-base font-semibold">Share this article</SheetTitle>
        </SheetHeader>

        {/* Animated preview card */}
        <div className="px-4 pb-4">
          <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/60 backdrop-blur
            shadow-[0_10px_30px_-15px_hsl(var(--foreground)/0.4)]
            animate-in fade-in-0 zoom-in-95 duration-300">
            {image && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-foreground border border-border/60">
                  Preview
                </span>
              </div>
            )}
            <div className="p-3.5 space-y-1.5">
              <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">{title}</h4>
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
              )}
              <p className="text-[10px] text-muted-foreground/80 truncate pt-1">{fullUrl}</p>
            </div>
          </div>
        </div>

        {/* Platform actions grid */}
        <div className="px-4 pb-5">
          <div className="grid grid-cols-4 gap-3">
            {platforms.map((p, i) => (
              <button
                key={p.key}
                onClick={() => handleAction(p.key)}
                className="flex flex-col items-center gap-1.5 focus:outline-none group animate-in fade-in-0 slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
              >
                <span
                  className={`flex items-center justify-center h-12 w-12 rounded-2xl ${p.color} ring-2 ring-transparent ${p.ring}
                    shadow-[0_6px_20px_-8px_hsl(var(--foreground)/0.35)]
                    transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-105 group-active:scale-95`}
                >
                  {p.icon}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {p.label}
                </span>
              </button>
            ))}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={() => handleAction("native")}
                className="flex flex-col items-center gap-1.5 focus:outline-none group animate-in fade-in-0 slide-in-from-bottom-2"
                style={{ animationDelay: `${platforms.length * 40}ms`, animationFillMode: "backwards" }}
              >
                <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-accent to-primary text-accent-foreground shadow-[0_6px_20px_-8px_hsl(var(--accent)/0.5)] transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-105 group-active:scale-95">
                  <Share2 className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  More
                </span>
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (variant === "dropdown") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`${buttonSize} rounded-full share-icon-btn hover:bg-accent/10 hover:text-accent sm:inline-flex hidden`}
              aria-label="Share this article"
            >
              <Share2 className={iconSize} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-border rounded-xl p-1.5">
            <DropdownMenuItem onClick={() => openShare("facebook")} className="cursor-pointer rounded-lg gap-2 focus:bg-blue-600/10 focus:text-blue-600">
              <Facebook className="h-4 w-4 text-blue-600" /> Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShare("twitter")} className="cursor-pointer rounded-lg gap-2 focus:bg-sky-500/10 focus:text-sky-500">
              <Twitter className="h-4 w-4 text-sky-500" /> Twitter / X
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShare("linkedin")} className="cursor-pointer rounded-lg gap-2 focus:bg-blue-700/10 focus:text-blue-700">
              <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShare("whatsapp")} className="cursor-pointer rounded-lg gap-2 focus:bg-green-500/10 focus:text-green-500">
              <Send className="h-4 w-4 text-green-500" /> WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer rounded-lg gap-2">
              <Link2 className="h-4 w-4" /> Copy Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Mobile trigger — single icon opens preview sheet */}
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonSize} rounded-full share-icon-btn hover:bg-accent/10 hover:text-accent sm:hidden`}
          aria-label="Share this article"
          onClick={() => openSheet()}
        >
          <Share2 className={iconSize} />
        </Button>
        {previewSheet}
      </>
    );
  }

  const inlineSocials = [
    { key: "facebook" as Platform, icon: <Facebook className={iconSize} />, label: "Share on Facebook", cls: "hover:bg-blue-600/15 hover:text-blue-500" },
    { key: "twitter" as Platform, icon: <Twitter className={iconSize} />, label: "Share on Twitter/X", cls: "hover:bg-sky-500/15 hover:text-sky-400" },
    { key: "linkedin" as Platform, icon: <Linkedin className={iconSize} />, label: "Share on LinkedIn", cls: "hover:bg-blue-700/15 hover:text-blue-500" },
    { key: "whatsapp" as Platform, icon: <Send className={iconSize} />, label: "Share on WhatsApp", cls: "hover:bg-green-500/15 hover:text-green-400" },
    { key: "copy" as Platform, icon: copied ? <Check className={iconSize} /> : <Link2 className={iconSize} />, label: "Copy link", cls: "hover:bg-accent/15 hover:text-accent" },
  ];

  return (
    <>
      {/* Mobile: single clean row of icons (all tap targets 40px, even spacing) */}
      <div className="sm:hidden flex w-full items-center justify-between gap-1.5">
        {inlineSocials.map((s) => (
          <button
            key={s.key}
            onClick={() => openSheet()}
            title={s.label}
            aria-label={s.label}
            className={`flex-1 min-w-0 h-10 max-w-[3rem] inline-flex items-center justify-center
              rounded-xl border border-border/50 bg-background/60 backdrop-blur
              text-muted-foreground share-icon-btn ${s.cls}
              transition-all duration-200 active:scale-90`}
          >
            {s.icon}
          </button>
        ))}
        <button
          onClick={() => openSheet()}
          aria-label="More share options"
          className="flex-1 min-w-0 h-10 max-w-[3rem] inline-flex items-center justify-center rounded-xl
            bg-gradient-to-br from-accent to-primary text-accent-foreground
            shadow-[0_6px_18px_-8px_hsl(var(--accent)/0.6)]
            transition-all duration-200 hover:-translate-y-0.5 active:scale-90"
        >
          <Share2 className={iconSize} />
        </button>
      </div>

      {/* Desktop / tablet: inline row */}
      <div className="hidden sm:flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-1">Share:</span>
        {inlineSocials.map((s) => (
          <Button
            key={s.key}
            variant="ghost"
            size="icon"
            className={`${buttonSize} rounded-full share-icon-btn border border-border/50 bg-background/60 backdrop-blur ${s.cls}`}
            onClick={() => handleIconClick(s.key)}
            title={s.label}
            aria-label={s.label}
          >
            {s.icon}
          </Button>
        ))}
      </div>


      {previewSheet}
    </>
  );
};
