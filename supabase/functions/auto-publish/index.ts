import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find posts that need to be published
    const { data: postsToPublish, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, excerpt, author_id")
      .eq("status", "draft")
      .not("scheduled_publish_at", "is", null)
      .lte("scheduled_publish_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    console.log(`Found ${postsToPublish?.length || 0} posts to auto-publish`);

    if (!postsToPublish || postsToPublish.length === 0) {
      return new Response(
        JSON.stringify({ message: "No posts to publish", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update posts to published
    const postIds = postsToPublish.map((p) => p.id);
    const { error: updateError } = await supabase
      .from("posts")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .in("id", postIds);

    if (updateError) throw updateError;

    // Get active subscribers for notification
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    // Notify subscribers about new posts
    if (subscribers && subscribers.length > 0) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

      if (RESEND_API_KEY) {
        for (const post of postsToPublish) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "Ajmal Vision News <news@yourdomain.com>",
                to: subscribers.map((s) => s.email),
                subject: `New Post: ${post.title}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1a365d;">${post.title}</h1>
                    <p style="color: #4a5568; font-size: 16px;">${post.excerpt || "Check out our latest post!"}</p>
                    <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/news/${post.id}" 
                       style="display: inline-block; background: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                      Read Now
                    </a>
                  </div>
                `,
              }),
            });
            console.log(`Notification sent for post: ${post.title}`);
          } catch (emailError) {
            console.error("Error sending notification:", emailError);
          }
        }
      }
    }

    console.log(`Successfully published ${postsToPublish.length} posts`);

    return new Response(
      JSON.stringify({
        message: "Posts published successfully",
        count: postsToPublish.length,
        posts: postsToPublish.map((p) => p.title),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in auto-publish function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);