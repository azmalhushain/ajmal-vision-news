import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const canonicalOrigin = "https://www.ajmalakhtar.com.np";
const defaultImage = `${canonicalOrigin}/og-news.jpg`;
const siteName = "Ajmal Akhtar Azad";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CRAWLER_PATTERN = /bot|crawler|spider|facebookexternalhit|facebot|whatsapp|telegrambot|linkedinbot|discordbot|twitterbot|slackbot|skypeuripreview|google-inspectiontool|bingpreview|applebot/i;

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const plainText = (value: string | null | undefined, maxLength: number) => {
  const text = (value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(text).slice(0, maxLength).join("");
};

const transformedImageUrl = (source: string | null) => {
  if (!source) return defaultImage;
  try {
    const image = new URL(source);
    const storageObjectPath = "/storage/v1/object/public/";
    if (image.pathname.includes(storageObjectPath)) {
      image.pathname = image.pathname.replace(storageObjectPath, "/storage/v1/render/image/public/");
      image.searchParams.set("width", "1200");
      image.searchParams.set("height", "630");
      image.searchParams.set("resize", "cover");
      image.searchParams.set("quality", "85");
    }
    return image.toString();
  } catch {
    return source;
  }
};

const errorResponse = (status: number, message: string) => new Response(message, {
  status,
  headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "HEAD") return errorResponse(405, "Method not allowed");

  const requestUrl = new URL(req.url);
  const postId = requestUrl.searchParams.get("post");
  if (!postId || !UUID_PATTERN.test(postId)) return errorResponse(400, "A valid post ID is required");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseKey) {
    console.error("News metadata is unavailable because the public database configuration is missing.");
    return errorResponse(500, "News metadata is temporarily unavailable");
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey);
    const { data: post, error } = await client
      .from("posts")
      .select("title, excerpt, content, image_url, status")
      .eq("id", postId)
      .maybeSingle();

    if (error) {
      console.error("Could not load shared news post:", error.message);
      return errorResponse(502, "Could not load this news post");
    }
    if (!post || post.status !== "published") return errorResponse(404, "News post not found");

    const postUrl = `${canonicalOrigin}/news?post=${encodeURIComponent(postId)}`;
    const userAgent = req.headers.get("user-agent") || "";

    // Direct visits to the helper endpoint always land on the actual post.
    // Crawlers receive metadata instead; the News page itself remains canonical.
    if (!CRAWLER_PATTERN.test(userAgent)) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: postUrl,
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    const title = plainText(post.title, 200) || siteName;
    const description = plainText(post.excerpt || post.content, 300) || "News and updates from Ajmal Akhtar Azad.";
    const image = transformedImageUrl(post.image_url);
    const language = /[\u0900-\u097F]/u.test(title) ? "ne" : "en";
    const eTitle = escapeHtml(title);
    const eDescription = escapeHtml(description);
    const eImage = escapeHtml(image);
    const ePostUrl = escapeHtml(postUrl);
    const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${eTitle}</title>
  <meta name="description" content="${eDescription}">
  <link rel="canonical" href="${ePostUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:url" content="${ePostUrl}">
  <meta property="og:title" content="${eTitle}">
  <meta property="og:description" content="${eDescription}">
  <meta property="og:image" content="${eImage}">
  <meta property="og:image:secure_url" content="${eImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${eTitle}">
  <meta property="og:locale" content="${language === "ne" ? "ne_NP" : "en_US"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${eTitle}">
  <meta name="twitter:description" content="${eDescription}">
  <meta name="twitter:image" content="${eImage}">
  <meta name="twitter:image:alt" content="${eTitle}">
</head>
<body><p>${eTitle}</p></body>
</html>`;

    return new Response(req.method === "HEAD" ? null : html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Language": language,
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("News metadata generation failed:", error);
    return errorResponse(500, "News metadata is temporarily unavailable");
  }
});