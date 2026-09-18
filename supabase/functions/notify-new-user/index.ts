import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { esc, serviceClient } from "../_shared/auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    if (!/^[0-9a-f-]{36}$/i.test(userId)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = serviceClient();

    // Only notify for users that genuinely exist; ignore any client-supplied details.
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: "Unknown user" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const email = esc(authUser.user.email || "Not provided", 200);
    const fullName = esc(profile?.full_name || authUser.user.user_metadata?.full_name || "Not provided", 160);

    const { data: notifications } = await supabase
      .from("admin_notifications")
      .select("admin_email")
      .eq("notify_on_new_user", true);

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No admin emails configured for notifications" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const adminEmails = notifications.map((n) => n.admin_email);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Notifications <onboarding@resend.dev>",
        to: adminEmails,
        subject: "New User Registration Alert",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New User Registration</h1>
          <p style="font-size: 16px; color: #555;">A new user has registered on your website:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Registered At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <a href="https://ajmalazad.lovable.app/admin/users"
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Manage Users
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
    console.error("Error in notify-new-user function:", error);
    return new Response(JSON.stringify({ error: "Unable to send notification" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
