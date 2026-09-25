import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://ajmalakhtar.com.np";

function escapeXml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const staticPages = [
      { url: "", priority: "1.0", changefreq: "daily" },
      { url: "/news", priority: "0.9", changefreq: "daily" },
      { url: "/sports", priority: "0.95", changefreq: "hourly" },
      { url: "/about", priority: "0.8", changefreq: "monthly" },
      { url: "/vision", priority: "0.8", changefreq: "monthly" },
      { url: "/gallery", priority: "0.7", changefreq: "weekly" },
      { url: "/podcasts", priority: "0.7", changefreq: "weekly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
    ];

    const [postsRes, matchesRes, teamsRes, playersRes, sportsNewsRes, galleryRes] = await Promise.all([
      supabase.from("posts").select("id, title, updated_at, created_at, category, featured_image")
        .eq("status", "published").order("created_at", { ascending: false }),
      supabase.from("matches").select("id, scheduled_at, updated_at, status").order("scheduled_at", { ascending: false }),
      supabase.from("teams").select("slug, updated_at").eq("is_active", true),
      supabase.from("players").select("slug, updated_at").eq("is_active", true),
      supabase.from("sports_news").select("id, title, published_at, updated_at")
        .eq("status", "published").order("published_at", { ascending: false }),
      supabase.from("gallery_images").select("image_url, title, alt_text")
        .eq("is_active", true).order("display_order"),
    ]);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // News posts (with Google News + image extensions)
    for (const post of postsRes.data || []) {
      const lastMod = (post.updated_at || post.created_at)?.split("T")[0];
      sitemap += `  <url>
    <loc>${SITE_URL}/news?post=${post.id}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
    <news:news>
      <news:publication>
        <news:name>Ajmal Akhtar Azad — Official</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.created_at}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>${post.featured_image ? `
    <image:image>
      <image:loc>${escapeXml(post.featured_image)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>` : ""}
  </url>
`;
    }

    // Sports — matches
    for (const m of matchesRes.data || []) {
      const lastMod = m.updated_at?.split("T")[0];
      const live = m.status === "live";
      sitemap += `  <url>
    <loc>${SITE_URL}/sports/match/${m.id}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ""}
    <changefreq>${live ? "always" : "weekly"}</changefreq>
    <priority>${live ? "0.9" : "0.7"}</priority>
  </url>
`;
    }

    // Sports — teams
    for (const t of teamsRes.data || []) {
      if (!t.slug) continue;
      const lastMod = t.updated_at?.split("T")[0];
      sitemap += `  <url>
    <loc>${SITE_URL}/sports/team/${t.slug}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Sports — players
    for (const p of playersRes.data || []) {
      if (!p.slug) continue;
      const lastMod = p.updated_at?.split("T")[0];
      sitemap += `  <url>
    <loc>${SITE_URL}/sports/player/${p.slug}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    // Sports news (rendered inside /sports)
    for (const sn of sportsNewsRes.data || []) {
      const lastMod = (sn.updated_at || sn.published_at)?.split("T")[0];
      sitemap += `  <url>
    <loc>${SITE_URL}/sports?news=${sn.id}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    // Make active gallery media discoverable to image search without fabricating
    // per-image page URLs; the gallery page is the canonical landing page.
    if (galleryRes.data?.length) {
      const galleryImages = galleryRes.data.map((image) => `
      <image:image>
        <image:loc>${escapeXml(image.image_url)}</image:loc>
        <image:title>${escapeXml(image.alt_text || image.title)}</image:title>
      </image:image>`).join("");
      sitemap = sitemap.replace(
        `    <loc>${SITE_URL}/gallery</loc>`,
        `    <loc>${SITE_URL}/gallery</loc>${galleryImages}`,
      );
    }

    sitemap += `</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Sitemap error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>${escapeXml(error.message)}</error>`,
      { status: 500, headers: { "Content-Type": "application/xml", ...corsHeaders } },
    );
  }
});
