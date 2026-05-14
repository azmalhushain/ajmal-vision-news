// Imports KPL teams and fixtures from kplt20.org via Firecrawl + Lovable AI extraction.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FC = "https://api.firecrawl.dev/v2";
const AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function scrape(url: string) {
  const r = await fetch(`${FC}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("FIRECRAWL_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: ["markdown", "links"], onlyMainContent: true }),
  });
  if (!r.ok) throw new Error(`Firecrawl ${r.status}: ${await r.text()}`);
  return r.json();
}

async function aiExtract(prompt: string) {
  const r = await fetch(AI, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Return strictly valid JSON. No markdown, no commentary." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
  const d = await r.json();
  return JSON.parse(d.choices?.[0]?.message?.content || "{}");
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Ensure tournament exists
    const tslug = "kpl-3";
    let { data: tournament } = await sb.from("tournaments").select("id").eq("slug", tslug).maybeSingle();
    if (!tournament) {
      const { data: created } = await sb.from("tournaments").insert({
        name: "Karnali Premier League 3", slug: tslug, season: "2026", status: "ongoing",
        description: "Imported from kplt20.org",
      }).select("id").single();
      tournament = created!;
    }

    // Scrape main pages
    const homeRes = await scrape("https://kplt20.org");
    const homeMd = homeRes.data?.markdown || homeRes.markdown || "";
    const links: string[] = homeRes.data?.links || homeRes.links || [];
    const teamsLink = links.find(l => /team/i.test(l)) || "https://kplt20.org/teams";
    const fixturesLink = links.find(l => /(fixture|schedule|match)/i.test(l)) || "https://kplt20.org/fixtures";

    let teamsCreated = 0, matchesCreated = 0;
    const errors: string[] = [];

    // Extract teams
    try {
      const teamsRes = await scrape(teamsLink);
      const teamsMd = teamsRes.data?.markdown || teamsRes.markdown || homeMd;
      const teamsJson = await aiExtract(`Extract every cricket team mentioned. Return JSON: {"teams":[{"name":"...","short_name":"3-letter code","logo_url":"absolute url or null","color_primary":"hex or null","home_ground":"... or null"}]}\n\nContent:\n${teamsMd.slice(0, 8000)}`);
      for (const t of teamsJson.teams || []) {
        if (!t.name) continue;
        const slug = slugify(t.name);
        const { data: ex } = await sb.from("teams").select("id").eq("slug", slug).maybeSingle();
        if (!ex) {
          await sb.from("teams").insert({
            tournament_id: tournament.id, name: t.name, slug,
            short_name: t.short_name?.toUpperCase() || t.name.slice(0, 3).toUpperCase(),
            logo_url: t.logo_url || null, color_primary: t.color_primary || "#1a1a1a",
            home_ground: t.home_ground || null,
          });
          teamsCreated++;
        }
      }
    } catch (e: any) { errors.push(`teams: ${e.message}`); }

    // Extract fixtures
    try {
      const fxRes = await scrape(fixturesLink);
      const fxMd = fxRes.data?.markdown || fxRes.markdown || "";
      const fxJson = await aiExtract(`Extract every match/fixture. Return JSON: {"matches":[{"match_no":1,"team_a":"...","team_b":"...","scheduled_at":"ISO8601 or null","venue":"... or null","status":"scheduled|live|completed","result":"... or null"}]}\n\nContent:\n${fxMd.slice(0, 10000)}`);
      const { data: allTeams } = await sb.from("teams").select("id, name, slug");
      const tmap: Record<string, string> = {};
      (allTeams || []).forEach(t => { tmap[slugify(t.name)] = t.id; });
      for (const m of fxJson.matches || []) {
        const a = tmap[slugify(m.team_a || "")];
        const b = tmap[slugify(m.team_b || "")];
        if (!a || !b || !m.match_no) continue;
        const { data: ex } = await sb.from("matches").select("id")
          .eq("tournament_id", tournament.id).eq("match_no", m.match_no).maybeSingle();
        if (!ex) {
          await sb.from("matches").insert({
            tournament_id: tournament.id, match_no: m.match_no,
            team_a_id: a, team_b_id: b,
            scheduled_at: m.scheduled_at || null, venue: m.venue || null,
            status: ["scheduled", "live", "completed"].includes(m.status) ? m.status : "scheduled",
            result_text: m.result || null,
          });
          matchesCreated++;
        }
      }
    } catch (e: any) { errors.push(`fixtures: ${e.message}`); }

    return Response.json({ ok: true, teamsCreated, matchesCreated, errors }, { headers: corsHeaders });
  } catch (e: any) {
    console.error("kpl-import error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
