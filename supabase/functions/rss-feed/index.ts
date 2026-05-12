import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://www.ajmalakhtar.com.np";
const SITE_NAME = "Ajmal Akhtar Azad — News & Updates";
const SITE_DESC =
  "Latest news from Mayor Ajmal Akhtar Azad and Bhokraha Narsingh Municipality.";

function escapeXml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(s: string): string {
  return (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
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

    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, excerpt, content, image_url, category, created_at, updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    const items = (posts || [])
      .map((p) => {
        const link = `${SITE_URL}/news?post=${p.id}`;
        const desc = escapeXml(p.excerpt || stripHtml(p.content).slice(0, 280));
        const enclosure = p.image_url
          ? `<enclosure url="${escapeXml(p.image_url)}" type="image/jpeg" />`
          : "";
        return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${p.id}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <category>${escapeXml(p.category || "News")}</category>
      <description>${desc}</description>
      ${enclosure}
    </item>`;
      })
      .join("\n");

    const lastBuild = posts?.[0]?.updated_at
      ? new Date(posts[0].updated_at).toUTCString()
      : new Date().toUTCString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/news</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  } catch (e: any) {
    console.error("rss-feed error:", e);
    return new Response(`<?xml version="1.0"?><error>${escapeXml(e.message)}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
