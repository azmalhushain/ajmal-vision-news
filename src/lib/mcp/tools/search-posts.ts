import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_posts",
  title: "Search news posts",
  description: "Search published news articles by title, excerpt or category and return summaries with ids.",
  inputSchema: {
    query: z.string().trim().optional().describe("Text to match in the title or excerpt."),
    category: z.string().trim().optional().describe("Filter by category."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of posts to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("posts")
      .select("id, title, excerpt, category, image_url, status, views, likes_count, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);

    if (category) request = request.eq("category", category);
    if (query) request = request.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
