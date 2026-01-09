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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const siteUrl = "https://ajmal-vision-news.lovable.app";
    const now = new Date().toISOString();

    // Static pages
    const staticPages = [
      { url: "", priority: "1.0", changefreq: "daily" },
      { url: "/news", priority: "0.9", changefreq: "daily" },
      { url: "/about", priority: "0.8", changefreq: "weekly" },
      { url: "/vision", priority: "0.8", changefreq: "weekly" },
      { url: "/gallery", priority: "0.7", changefreq: "weekly" },
      { url: "/podcasts", priority: "0.7", changefreq: "weekly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
    ];

    // Fetch all published posts
    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, updated_at, created_at, category")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${now.split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add posts
    if (posts) {
      for (const post of posts) {
        const lastMod = (post.updated_at || post.created_at).split('T')[0];
        sitemap += `  <url>
    <loc>${siteUrl}/news?post=${post.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>Ajmal Vision News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.created_at}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Sitemap error:", error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><error>${error.message}</error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml", ...corsHeaders },
    });
  }
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
