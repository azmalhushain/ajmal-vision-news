import { supabase } from "@/integrations/supabase/client";

/** Canonical production domain, used only when there is no browser origin. */
export const SITE_URL = "https://www.ajmalakhtar.com.np";

/** Public, canonical URL used in every share action for a News post. */
export const canonicalNewsPostUrl = (postId: string | number): string =>
  `${SITE_URL}${newsPostUrl(postId)}`;

/** Ask public Supabase Storage for a share-sized crop of a stored post image. */
export const socialImageUrl = (imageUrl?: string | null): string | undefined => {
  if (!imageUrl) return undefined;
  try {
    const image = new URL(imageUrl);
    const objectPath = "/storage/v1/object/public/";
    if (image.pathname.includes(objectPath)) {
      image.pathname = image.pathname.replace(objectPath, "/storage/v1/render/image/public/");
      image.searchParams.set("width", "1200");
      image.searchParams.set("height", "630");
      image.searchParams.set("resize", "cover");
      image.searchParams.set("quality", "85");
    }
    return image.toString();
  } catch {
    return imageUrl;
  }
};

export const getOrigin = (): string => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return SITE_URL;
};

/** Turns a relative path into a fully-qualified, same-origin URL. */
export const toAbsoluteUrl = (url: string): string => {
  if (!url) return getOrigin();
  if (/^https?:\/\//i.test(url)) return url;
  return `${getOrigin()}${url.startsWith("/") ? url : `/${url}`}`;
};

/** Canonical deep link that opens a specific news post. */
export const newsPostUrl = (postId: string | number): string =>
  `/news?post=${encodeURIComponent(String(postId))}`;

export type SharePlatform =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "telegram"
  | "copy"
  | "native";

export type ShareAction = "share_open" | "share_click";

interface TrackShareInput {
  platform: SharePlatform | "sheet";
  action: ShareAction;
  contentType?: string;
  contentId?: string | null;
  shareUrl?: string;
}

/** Fire-and-forget analytics for share icon taps and confirmed shares. */
export const trackShare = ({
  platform,
  action,
  contentType = "post",
  contentId = null,
  shareUrl = "",
}: TrackShareInput): void => {
  const device =
    typeof window === "undefined"
      ? "unknown"
      : window.matchMedia("(max-width: 639px)").matches
        ? "mobile"
        : window.matchMedia("(max-width: 1023px)").matches
          ? "tablet"
          : "desktop";

  void (async () => {
    try {
      const { data } = await supabase.auth.getUser();
      await supabase.from("share_events").insert({
        platform,
        action,
        content_type: contentType,
        content_id: contentId,
        share_url: shareUrl,
        page_path: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
        device,
        user_id: data?.user?.id ?? null,
      });
    } catch (err) {
      console.warn("share tracking failed", err);
    }
  })();
};
