// SEO Insights edge function — proxies Google Search Console + Semrush via Lovable connector gateway
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { HttpError, requireAdmin } from "../_shared/auth.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
const SEMRUSH_KEY = Deno.env.get("SEMRUSH_API_KEY");

const GATEWAY = "https://connector-gateway.lovable.dev";

function gwHeaders(connKey: string) {
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": connKey,
    "Content-Type": "application/json",
  };
}

async function gscRequest(path: string, init?: RequestInit) {
  if (!GSC_KEY) throw new Error("Google Search Console not connected");
  const res = await fetch(`${GATEWAY}/google_search_console${path}`, {
    ...init,
    headers: { ...gwHeaders(GSC_KEY), ...(init?.headers || {}) },
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`GSC ${res.status}: ${text.slice(0, 300)}`);
  return json;
}

async function semrushRequest(path: string) {
  if (!SEMRUSH_KEY) throw new Error("Semrush not connected");
  const res = await fetch(`${GATEWAY}/semrush${path}`, {
    headers: { ...gwHeaders(SEMRUSH_KEY), "Allow-Limit-Offset": "true" },
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`Semrush ${res.status}: ${text.slice(0, 300)}`);
  return json;
}

function todayMinus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, siteUrl, domain, database = "us", days = 28, dimensions = ["date"], rowLimit = 25 } = await req.json();

    // ────────────── GOOGLE SEARCH CONSOLE ──────────────
    if (action === "gsc_sites") {
      const data = await gscRequest("/webmasters/v3/sites");
      return json({ ok: true, sites: data.siteEntry || [] });
    }

    if (action === "gsc_search_analytics") {
      if (!siteUrl) throw new Error("siteUrl required");
      const encoded = encodeURIComponent(siteUrl);
      const body = {
        startDate: todayMinus(days),
        endDate: todayMinus(1),
        dimensions,
        rowLimit,
      };
      const data = await gscRequest(
        `/webmasters/v3/sites/${encoded}/searchAnalytics/query`,
        { method: "POST", body: JSON.stringify(body) },
      );
      return json({ ok: true, rows: data.rows || [] });
    }

    if (action === "gsc_summary") {
      if (!siteUrl) throw new Error("siteUrl required");
      const encoded = encodeURIComponent(siteUrl);
      const [trend, queries, pages, countries, devices] = await Promise.all([
        gscRequest(`/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
          method: "POST",
          body: JSON.stringify({ startDate: todayMinus(days), endDate: todayMinus(1), dimensions: ["date"], rowLimit: days }),
        }).catch(() => ({ rows: [] })),
        gscRequest(`/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
          method: "POST",
          body: JSON.stringify({ startDate: todayMinus(days), endDate: todayMinus(1), dimensions: ["query"], rowLimit: 20 }),
        }).catch(() => ({ rows: [] })),
        gscRequest(`/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
          method: "POST",
          body: JSON.stringify({ startDate: todayMinus(days), endDate: todayMinus(1), dimensions: ["page"], rowLimit: 20 }),
        }).catch(() => ({ rows: [] })),
        gscRequest(`/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
          method: "POST",
          body: JSON.stringify({ startDate: todayMinus(days), endDate: todayMinus(1), dimensions: ["country"], rowLimit: 10 }),
        }).catch(() => ({ rows: [] })),
        gscRequest(`/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
          method: "POST",
          body: JSON.stringify({ startDate: todayMinus(days), endDate: todayMinus(1), dimensions: ["device"], rowLimit: 5 }),
        }).catch(() => ({ rows: [] })),
      ]);

      const trendRows: any[] = (trend as any).rows || [];
      const totals = trendRows.reduce(
        (acc, r) => {
          acc.clicks += r.clicks || 0;
          acc.impressions += r.impressions || 0;
          return acc;
        },
        { clicks: 0, impressions: 0 },
      );
      const avgCtr = totals.impressions ? totals.clicks / totals.impressions : 0;
      const avgPos = trendRows.length
        ? trendRows.reduce((s, r) => s + (r.position || 0), 0) / trendRows.length
        : 0;

      return json({
        ok: true,
        totals: { ...totals, ctr: avgCtr, position: avgPos },
        trend: trendRows,
        queries: (queries as any).rows || [],
        pages: (pages as any).rows || [],
        countries: (countries as any).rows || [],
        devices: (devices as any).rows || [],
      });
    }

    // ────────────── SEMRUSH ──────────────
    if (action === "semrush_domain") {
      if (!domain) throw new Error("domain required");
      const cols = "Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac";
      const data = await semrushRequest(
        `/domains/domain_ranks?domain=${encodeURIComponent(domain)}&database=${database}&export_columns=${cols}`,
      );
      return json({ ok: true, data: data.data || data });
    }

    if (action === "semrush_top_keywords") {
      if (!domain) throw new Error("domain required");
      const cols = "Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc";
      const data = await semrushRequest(
        `/domains/domain_organic?domain=${encodeURIComponent(domain)}&database=${database}&export_columns=${cols}&display_limit=25`,
      );
      return json({ ok: true, data: data.data || data });
    }

    if (action === "semrush_backlinks") {
      if (!domain) throw new Error("domain required");
      const cols = "ascore,total,domains_num,urls_num,ips_num,ipclassc_num,follows_num,nofollows_num,texts_num,images_num,forms_num,frames_num";
      const data = await semrushRequest(
        `/backlinks/backlinks_overview?target=${encodeURIComponent(domain)}&target_type=root_domain&export_columns=${cols}`,
      );
      return json({ ok: true, data: data.data || data });
    }

    if (action === "semrush_user_limits") {
      const data = await semrushRequest(`/user/limits`);
      return json({ ok: true, data: data.data || data });
    }

    return json({ ok: false, error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    console.error("seo-insights error:", e);
    return json({ ok: false, error: e.message || String(e) }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
