import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const PAGE_ID = Deno.env.get("FB_PAGE_ID");
    const TOKEN = Deno.env.get("FB_PAGE_ACCESS_TOKEN");
    if (!PAGE_ID || !TOKEN) throw new Error("Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN");

    const fields = "id,message,permalink_url,created_time,full_picture,attachments{media,subattachments{media}}";
    const url = `https://graph.facebook.com/v20.0/${PAGE_ID}/posts?fields=${encodeURIComponent(fields)}&limit=25&access_token=${TOKEN}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(`FB error ${res.status}: ${JSON.stringify(json)}`);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let upserted = 0;
    for (const p of (json.data || [])) {
      const media: string[] = [];
      if (p.full_picture) media.push(p.full_picture);
      const subs = p.attachments?.data?.[0]?.subattachments?.data || [];
      for (const s of subs) if (s?.media?.image?.src) media.push(s.media.image.src);

      const { error } = await supabase.from("social_posts_cache").upsert({
        source: "facebook",
        external_id: p.id,
        message: p.message || null,
        permalink: p.permalink_url || null,
        posted_at: p.created_time || null,
        media_urls: media,
        raw: p,
        fetched_at: new Date().toISOString(),
      }, { onConflict: "source,external_id" });
      if (!error) upserted++;
    }

    return new Response(JSON.stringify({ ok: true, upserted, total: json.data?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
