import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewUserPayload {
  user_id: string;
  email: string;
  full_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, full_name }: NewUserPayload = await req.json();

    // Get admin notification emails from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: notifications } = await supabase
      .from("admin_notifications")
      .select("admin_email")
      .eq("notify_on_new_user", true);

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No admin emails configured for notifications" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
            <p><strong>Name:</strong> ${full_name || "Not provided"}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>User ID:</strong> ${user_id}</p>
            <p><strong>Registered At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="font-size: 14px; color: #888;">
            This user has been assigned the default "user" role. You can manage their role in the admin dashboard.
          </p>
          <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/admin/users" 
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Manage Users
          </a>
        </div>
      `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-new-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);