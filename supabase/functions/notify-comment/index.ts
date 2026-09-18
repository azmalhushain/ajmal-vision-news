import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { esc, serviceClient } from "../_shared/auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "ajmalazad119@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const postId = typeof body.post_id === "string" ? body.post_id : "";
    if (!/^[0-9a-f-]{36}$/i.test(postId)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Only notify about comments that actually exist in the database.
    const sb = serviceClient();
    const { data: comment } = await sb
      .from("comments")
      .select("id, content, author_name, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!comment) {
      return new Response(JSON.stringify({ error: "No matching comment found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: post } = await sb
      .from("posts")
      .select("title")
      .eq("id", postId)
      .maybeSingle();

    const postTitle = esc(post?.title || "Untitled post", 200);
    const authorName = esc(comment.author_name || "Anonymous", 120);
    const content = esc(comment.content, 2000);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Comments <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `New Comment on: ${postTitle}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
            New Comment Submitted
          </h1>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 10px 0;"><strong>Post:</strong> ${postTitle}</p>
            <p style="margin: 0 0 10px 0;"><strong>Author:</strong> ${authorName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Comment:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; margin: 0; font-style: italic;">
              "${content}"
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #888;">
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <a href="https://ajmalazad.lovable.app/admin/comments"
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold;">
            Review Comments
          </a>
        </div>
      `,
      }),
    });

    const ok = emailResponse.ok;
    return new Response(JSON.stringify({ success: ok }), {
      status: ok ? 200 : 502,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in notify-comment function:", error);
    return new Response(JSON.stringify({ error: "Unable to send notification" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
