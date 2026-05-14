// AI helper for sports: caption suggestions, post-match summaries,
// and ball-by-ball score recomputation. Uses Lovable AI Gateway.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(model: string, messages: any[], json = false) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("AI rate limit. Try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, payload } = await req.json();
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === "caption") {
      const { imageUrl, context } = payload || {};
      const out = await callAI("google/gemini-2.5-flash", [
        { role: "system", content: "You write punchy, social-ready captions. Return JSON: {\"captions\": [\"...\",\"...\",\"...\"]}" },
        { role: "user", content: [
          { type: "text", text: `Write 3 short captions (max 120 chars each) for this image. Context: ${context || "Bhokraha Narsingh community photo"}` },
          ...(imageUrl ? [{ type: "image_url", image_url: { url: imageUrl } }] : []),
        ]},
      ], true);
      return Response.json(JSON.parse(out), { headers: corsHeaders });
    }

    if (action === "match-summary") {
      const { matchId } = payload;
      const { data: match } = await sb.from("matches").select("*").eq("id", matchId).maybeSingle();
      const { data: innings } = await sb.from("match_innings").select("*").eq("match_id", matchId).order("innings_no");
      const { data: events } = await sb.from("match_events").select("*").eq("match_id", matchId).order("over_no").order("ball_no");
      const { data: teams } = await sb.from("teams").select("id, name, short_name");
      const teamMap: Record<string, any> = {};
      (teams || []).forEach((t: any) => { teamMap[t.id] = t; });
      const ctx = {
        match: { ...match, team_a: teamMap[match?.team_a_id]?.name, team_b: teamMap[match?.team_b_id]?.name },
        innings: (innings || []).map((i: any) => ({ ...i, batting_team: teamMap[i.batting_team_id]?.name })),
        events_count: events?.length || 0,
      };
      const out = await callAI("google/gemini-2.5-pro", [
        { role: "system", content: "You are a cricket commentator. Write a 120-180 word post-match summary in clean markdown. Cover result, top performers (use innings totals), and turning points. End with a one-line headline." },
        { role: "user", content: `Write the post-match summary using this data:\n${JSON.stringify(ctx, null, 2)}` },
      ]);
      return Response.json({ summary: out }, { headers: corsHeaders });
    }

    if (action === "recompute-score") {
      const { matchId } = payload;
      const { data: events } = await sb.from("match_events").select("*").eq("match_id", matchId).order("innings_no").order("over_no").order("ball_no");
      const { data: match } = await sb.from("matches").select("*").eq("id", matchId).maybeSingle();
      if (!match) throw new Error("Match not found");

      // Aggregate per innings
      const agg: Record<number, { runs: number; wickets: number; balls: number; extras: number }> = {};
      for (const e of events || []) {
        const i = e.innings_no || 1;
        agg[i] = agg[i] || { runs: 0, wickets: 0, balls: 0, extras: 0 };
        agg[i].runs += (e.runs || 0) + (e.extra_runs || 0);
        agg[i].extras += e.extra_runs || 0;
        if (e.is_wicket) agg[i].wickets += 1;
        // Wides/no-balls don't count as a legal ball
        const isExtraNoBall = e.extra_type === "wd" || e.extra_type === "nb";
        if (!isExtraNoBall) agg[i].balls += 1;
      }

      // Determine batting/bowling per innings
      for (const innStr of Object.keys(agg)) {
        const innNo = Number(innStr);
        const a = agg[innNo];
        const overs = Math.floor(a.balls / 6) + (a.balls % 6) / 10;
        // Innings 1: team_a bats; Innings 2: team_b bats (default)
        const battingId = innNo === 1 ? match.team_a_id : match.team_b_id;
        const bowlingId = innNo === 1 ? match.team_b_id : match.team_a_id;
        const { data: existing } = await sb.from("match_innings").select("id").eq("match_id", matchId).eq("innings_no", innNo).maybeSingle();
        const row = {
          match_id: matchId, innings_no: innNo, runs: a.runs, wickets: a.wickets,
          overs, extras: a.extras, batting_team_id: battingId, bowling_team_id: bowlingId,
          updated_at: new Date().toISOString(),
        };
        if (existing) await sb.from("match_innings").update(row).eq("id", existing.id);
        else await sb.from("match_innings").insert(row);
      }

      // Compute result text if both innings present
      let resultText = match.result_text;
      const i1 = agg[1], i2 = agg[2];
      if (i1 && i2) {
        if (i2.runs > i1.runs) {
          const wktsLeft = 10 - i2.wickets;
          resultText = `Team B won by ${wktsLeft} wicket${wktsLeft === 1 ? "" : "s"}`;
        } else if (i1.runs > i2.runs) {
          resultText = `Team A won by ${i1.runs - i2.runs} run${i1.runs - i2.runs === 1 ? "" : "s"}`;
        } else {
          resultText = "Match tied";
        }
      }
      await sb.from("matches").update({ result_text: resultText, updated_at: new Date().toISOString() }).eq("id", matchId);

      return Response.json({ ok: true, innings: agg, result: resultText }, { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("sports-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
