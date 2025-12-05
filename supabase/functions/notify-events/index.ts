import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "ajmalazad119@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventPayload {
  event_type: "comment" | "newsletter" | "new_user" | "new_post" | "contact";
  data: Record<string, any>;
}

const getEmailContent = (eventType: string, data: Record<string, any>) => {
  const timestamp = new Date().toLocaleString();
  
  switch (eventType) {
    case "comment":
      return {
        subject: `New Comment on: ${data.post_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
              🗨️ New Comment Submitted
            </h1>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p><strong>Post:</strong> ${data.post_title}</p>
              <p><strong>Author:</strong> ${data.author_name}</p>
              <p><strong>Comment:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px; font-style: italic;">"${data.content}"</p>
              <p style="font-size: 12px; color: #888;"><strong>Time:</strong> ${timestamp}</p>
            </div>
            <a href="https://kpswxkuzfnafsqeqaunt.lovable.app/admin/comments" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Review Comments
            </a>
          </div>
        `,
      };
    
    case "newsletter":
      return {
        subject: `New Newsletter Subscriber: ${data.email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
              📧 New Newsletter Subscriber
            </h1>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p><strong>Email:</strong> ${data.email}</p>
              <p style="font-size: 12px; color: #888;"><strong>Subscribed at:</strong> ${timestamp}</p>
            </div>
            <a href="https://kpswxkuzfnafsqeqaunt.lovable.app/admin/newsletter" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Subscribers
            </a>
          </div>
        `,
      };
    
    case "new_user":
      return {
        subject: `New User Registration: ${data.email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">
              👤 New User Registered
            </h1>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Name:</strong> ${data.full_name || "Not provided"}</p>
              <p style="font-size: 12px; color: #888;"><strong>Registered at:</strong> ${timestamp}</p>
            </div>
            <a href="https://kpswxkuzfnafsqeqaunt.lovable.app/admin/users" 
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Users
            </a>
          </div>
        `,
      };
    
    case "new_post":
      return {
        subject: `New Post Published: ${data.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
              📝 New Post Published
            </h1>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p><strong>Title:</strong> ${data.title}</p>
              <p><strong>Category:</strong> ${data.category || "General"}</p>
              <p><strong>Status:</strong> ${data.status}</p>
              <p style="font-size: 12px; color: #888;"><strong>Created at:</strong> ${timestamp}</p>
            </div>
            <a href="https://kpswxkuzfnafsqeqaunt.lovable.app/admin/posts" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Posts
            </a>
          </div>
        `,
      };
    
    case "contact":
      return {
        subject: `New Contact Form Submission from ${data.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">
              📬 New Contact Message
            </h1>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Subject:</strong> ${data.subject || "No subject"}</p>
              <p><strong>Message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 4px;">${data.message}</p>
              <p style="font-size: 12px; color: #888;"><strong>Received at:</strong> ${timestamp}</p>
            </div>
          </div>
        `,
      };
    
    default:
      return {
        subject: `Website Event: ${eventType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Website Event</h1>
            <p><strong>Event Type:</strong> ${eventType}</p>
            <p><strong>Data:</strong></p>
            <pre style="background: #f8f9fa; padding: 15px; border-radius: 8px;">${JSON.stringify(data, null, 2)}</pre>
            <p style="font-size: 12px; color: #888;"><strong>Time:</strong> ${timestamp}</p>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-events function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_type, data }: EventPayload = await req.json();
    
    console.log("Received event notification:", { event_type, data });

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, html } = getEmailContent(event_type, data);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Website Notifications <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent result:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-events function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
