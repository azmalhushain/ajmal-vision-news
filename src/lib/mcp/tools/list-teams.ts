import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_teams",
  title: "List tournament teams",
  description: "List the active teams taking part in the tournament, with slugs usable by list_players.",
  inputSchema: { limit: z.number().int().min(1).max(50).default(20).describe("Maximum teams to return.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, short_name, slug, home_ground, founded_year, logo_url, description")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(limit ?? 20);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { teams: data ?? [] },
    };
  },
});
