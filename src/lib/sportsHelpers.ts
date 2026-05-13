import { supabase } from "@/integrations/supabase/client";

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function uploadSportsLogo(file: File, prefix = "team"): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("sports-logos").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("sports-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadSportsMedia(file: File, prefix = "media"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("sports-media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("sports-media").getPublicUrl(path);
  return data.publicUrl;
}

export function youtubeEmbed(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1`;
    if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}?autoplay=1`;
    if (u.pathname.startsWith("/live/")) return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}?autoplay=1`;
    if (u.pathname.startsWith("/embed/")) return `${url}${url.includes("?") ? "&" : "?"}autoplay=1`;
    return url;
  } catch { return null; }
}

export function formatOvers(overs: number): string {
  const whole = Math.floor(overs);
  const balls = Math.round((overs - whole) * 10);
  return `${whole}.${balls}`;
}
