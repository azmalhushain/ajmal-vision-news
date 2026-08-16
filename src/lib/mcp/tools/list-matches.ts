import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_matches",
  title: "List cricket matches",
  description: "List tournament matches (fixtures, live games and results) with teams, venue and status.",
  inputSchema: {
    status: z.enum(["scheduled", "live", "completed", "abandoned"]).optional().describe("Filter by match status."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum matches to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("matches")
      .select(
        "id, match_no, status, scheduled_at, venue, result_text, youtube_url, is_live_stream, team_a:teams!matches_team_a_id_fkey(name, short_name), team_b:teams!matches_team_b_id_fkey(name, short_name)",
      )
      .order("scheduled_at", { ascending: true })
      .limit(limit ?? 10);

    if (status) request = request.eq("status", status);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { matches: data ?? [] },
    };
  },
});
