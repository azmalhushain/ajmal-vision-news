import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "ajmalazad119@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommentPayload {
  post_id: string;
  post_title: string;
  author_name: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-comment function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_id, post_title, author_name, content }: CommentPayload = await req.json();
    
    console.log("Received comment notification request:", { post_id, post_title, author_name });

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Comments <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `New Comment on: ${post_title}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
            New Comment Submitted
          </h1>
          <p style="font-size: 16px; color: #555;">
            A new comment has been submitted and is awaiting your approval:
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 10px 0;"><strong>Post:</strong> ${post_title}</p>
            <p style="margin: 0 0 10px 0;"><strong>Author:</strong> ${author_name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Comment:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; margin: 0; font-style: italic;">
              "${content}"
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #888;">
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <p style="font-size: 14px; color: #666;">
            Please review and approve this comment in your admin dashboard.
          </p>
          <a href="https://kpswxkuzfnafsqeqaunt.lovable.app/admin/comments" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold;">
            Review Comments
          </a>
        </div>
      `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent result:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-comment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
