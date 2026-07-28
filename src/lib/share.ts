import { supabase } from "@/integrations/supabase/client";

/** Canonical production domain, used only when there is no browser origin. */
export const SITE_URL = "https://www.ajmalakhtar.com.np";

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
