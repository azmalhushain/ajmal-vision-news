import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("post");
    const page = url.searchParams.get("page");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const siteUrl = "https://ajmal-vision-news.lovable.app";
    const defaultImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/6j4N84GNxsXn52PqWIVTQd9p8RI2/social-images/social-1764428453124-image1.jpg";
    const siteName = "Ajmal Akhtar Azad";
    
    let title = "Ajmal Akhtar Azad - Mayor of Bhokraha Narsingh Municipality";
    let description = "Official website of Mayor Ajmal Akhtar Azad - Bhokraha Narsingh Municipality. Together for development, dignity, and democracy.";
    let image = defaultImage;
    let pageUrl = siteUrl;
    let type = "website";

    if (postId) {
      // Fetch post details
      const { data: post } = await supabase
        .from("posts")
        .select("title, excerpt, content, image_url, created_at, category")
        .eq("id", postId)
        .single();

      if (post) {
        title = post.title;
        description = post.excerpt || post.content?.substring(0, 160) || description;
        image = post.image_url || defaultImage;
        pageUrl = `${siteUrl}/news?post=${postId}`;
        type = "article";
      }
    } else if (page) {
      // Static page meta
      const pageMeta: Record<string, { title: string; description: string; url: string }> = {
        news: {
          title: "News & Updates - Ajmal Akhtar Azad",
          description: "Stay informed about our development initiatives and community programs in Bhokraha Narsingh Municipality.",
          url: `${siteUrl}/news`,
        },
        about: {
          title: "About - Ajmal Akhtar Azad",
          description: "Learn about Mayor Ajmal Akhtar Azad and his vision for Bhokraha Narsingh Municipality.",
          url: `${siteUrl}/about`,
        },
        vision: {
          title: "Vision - Ajmal Akhtar Azad",
          description: "Our vision for a prosperous and developed Bhokraha Narsingh Municipality.",
          url: `${siteUrl}/vision`,
        },
        gallery: {
          title: "Gallery - Ajmal Akhtar Azad",
          description: "Photo gallery showcasing development activities and community events.",
          url: `${siteUrl}/gallery`,
        },
        podcasts: {
          title: "Podcasts - Ajmal Akhtar Azad",
          description: "Listen to podcasts and interviews from Mayor Ajmal Akhtar Azad.",
          url: `${siteUrl}/podcasts`,
        },
        contact: {
          title: "Contact - Ajmal Akhtar Azad",
          description: "Get in touch with the Mayor's office. We're here to serve the community.",
          url: `${siteUrl}/contact`,
        },
      };

      if (pageMeta[page]) {
        title = pageMeta[page].title;
        description = pageMeta[page].description;
        pageUrl = pageMeta[page].url;
      }
    }

    // Return HTML with proper OG meta tags for crawlers
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AjmalAkhtarAzad">
  <meta name="twitter:creator" content="@AjmalAkhtarAzad">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${title}">
  
  <!-- Redirect to actual page -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${title}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("OG Image error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
