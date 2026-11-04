import webpush from "npm:web-push@3.6.7";
import { serviceClient, requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    await requireAdmin(req);
  } catch (e: any) {
    return json({ error: e.message }, e.status || 401);
  }
  try {
    const { title, body, url, image } = await req.json();
    if (!title || typeof title !== "string" || title.length > 120) return json({ error: "Invalid title" }, 400);
    if (!body || typeof body !== "string" || body.length > 300) return json({ error: "Invalid message" }, 400);
    const link = typeof url === "string" && url.startsWith("/") ? url : "/";

    webpush.setVapidDetails(
      "mailto:info@ajmalakhtar.com.np",
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!,
    );
    const sb = serviceClient();
    const { data: subs, error } = await sb.from("push_subscriptions").select("endpoint, keys");
    if (error) throw error;

    const payload = JSON.stringify({ title, body, url: link, image: image || undefined, icon: "/favicon.svg" });
    let sent = 0, failed = 0;
    const dead: string[] = [];
    await Promise.all((subs || []).map(async (s: any) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 86400 });
        sent++;
      } catch (err: any) {
        failed++;
        if (err?.statusCode === 404 || err?.statusCode === 410) dead.push(s.endpoint);
      }
    }));
    if (dead.length) await sb.from("push_subscriptions").delete().in("endpoint", dead);
    await sb.from("push_notifications").insert({ title, body, url: link, icon: "/favicon.svg", sent_at: new Date().toISOString() });

    return json({ success: true, sent, failed, total: subs?.length || 0 });
  } catch (e: any) {
    console.error("send-push error", e);
    return json({ error: e.message }, 500);
  }
});
