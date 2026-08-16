import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_players",
  title: "List cricket players",
  description: "List squad players with role, team and season stats. Optionally filter by name or team slug.",
  inputSchema: {
    query: z.string().trim().optional().describe("Match part of the player's name."),
    team_slug: z.string().trim().optional().describe("Only players from this team slug."),
    limit: z.number().int().min(1).max(100).default(20).describe("Maximum players to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, team_slug, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);

    let teamId: string | undefined;
    if (team_slug) {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("slug", team_slug)
        .maybeSingle();
      if (teamError) return { content: [{ type: "text", text: teamError.message }], isError: true };
      if (!team) return { content: [{ type: "text", text: `No team found with slug ${team_slug}` }], isError: true };
      teamId = team.id;
    }

    let request = supabase
      .from("players")
      .select("id, name, slug, role, jersey_number, is_captain, is_overseas, batting_style, bowling_style, photo_url, stats, team:teams(name, short_name, slug)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(limit ?? 20);

    if (teamId) request = request.eq("team_id", teamId);
    if (query) request = request.ilike("name", `%${query}%`);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { players: data ?? [] },
    };
  },
});
