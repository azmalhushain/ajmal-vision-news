import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { esc, HttpError, requireAdmin, serviceClient } from "../_shared/auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "ajmalazad119@gmail.com";
const SITE = "https://ajmalazad.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PUBLIC_EVENTS = ["comment", "newsletter", "contact"] as const;
const ADMIN_EVENTS = ["new_user", "new_post", "newsletter_blast"] as const;

const isEmail = (v: unknown) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length < 255;
const isUuid = (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

const wrap = (title: string, accent: string, inner: string, cta?: { href: string; label: string }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333; border-bottom: 2px solid ${accent}; padding-bottom: 10px;">${title}</h1>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${accent};">
      ${inner}
      <p style="font-size: 12px; color: #888;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
    ${cta ? `<a href="${cta.href}" style="display: inline-block; background: ${accent}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">${cta.label}</a>` : ""}
  </div>
`;

/**
 * Builds the email only from records verified to exist in the database, so a
 * caller cannot fabricate notification content.
 */
async function buildEmail(eventType: string, data: Record<string, unknown>) {
  const sb = serviceClient();

  if (eventType === "comment") {
    if (!isUuid(data.post_id)) throw new HttpError(400, "Invalid request");
    const { data: comment } = await sb
      .from("comments")
      .select("content, author_name")
      .eq("post_id", data.post_id as string)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!comment) throw new HttpError(404, "No matching comment found");
    const { data: post } = await sb.from("posts").select("title").eq("id", data.post_id as string).maybeSingle();
    return {
      subject: `New Comment on: ${esc(post?.title || "post", 120)}`,
      html: wrap("New Comment Submitted", "#10b981", `
        <p><strong>Post:</strong> ${esc(post?.title || "Untitled", 200)}</p>
        <p><strong>Author:</strong> ${esc(comment.author_name || "Anonymous", 120)}</p>
        <p style="background: white; padding: 15px; border-radius: 4px; font-style: italic;">"${esc(comment.content)}"</p>
      `, { href: `${SITE}/admin/comments`, label: "Review Comments" }),
    };
  }

  if (eventType === "newsletter") {
    if (!isEmail(data.email)) throw new HttpError(400, "Invalid request");
    const { data: sub } = await sb
      .from("newsletter_subscribers")
      .select("email")
      .eq("email", data.email as string)
      .maybeSingle();
    if (!sub) throw new HttpError(404, "No matching subscriber found");
    return {
      subject: `New Newsletter Subscriber: ${esc(sub.email, 120)}`,
      html: wrap("New Newsletter Subscriber", "#3b82f6",
        `<p><strong>Email:</strong> ${esc(sub.email, 200)}</p>`,
        { href: `${SITE}/admin/newsletter`, label: "View Subscribers" }),
    };
  }

  if (eventType === "contact") {
    if (!isEmail(data.email)) throw new HttpError(400, "Invalid request");
    const { data: msg } = await sb
      .from("contact_messages")
      .select("name, email, message, subject")
      .eq("email", data.email as string)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!msg) throw new HttpError(404, "No matching message found");
    return {
      subject: `New Contact Form Submission from ${esc(msg.name || "visitor", 80)}`,
      html: wrap("New Contact Message", "#ef4444", `
        <p><strong>Name:</strong> ${esc(msg.name, 120)}</p>
        <p><strong>Email:</strong> ${esc(msg.email, 200)}</p>
        <p><strong>Subject:</strong> ${esc((msg as Record<string, unknown>).subject ?? "No subject", 200)}</p>
        <p style="background: white; padding: 15px; border-radius: 4px;">${esc(msg.message, 4000)}</p>
      `),
    };
  }

  // Admin-only events: content is trusted but still escaped.
  if (eventType === "new_post" || eventType === "newsletter_blast") {
    return {
      subject: esc((data.subject as string) || `New Post: ${data.post_title ?? ""}`, 200),
      html: wrap(eventType === "new_post" ? "New Post Published" : "Newsletter Sent", "#f59e0b", `
        <p><strong>Title:</strong> ${esc(data.post_title ?? data.title ?? "-", 200)}</p>
        <p>${esc(data.message ?? data.post_excerpt ?? "", 4000)}</p>
      `, { href: `${SITE}/admin/posts`, label: "View Posts" }),
    };
  }

  // new_user
  return {
    subject: "New User Registration",
    html: wrap("New User Registered", "#8b5cf6", `
      <p><strong>Email:</strong> ${esc(data.email ?? "-", 200)}</p>
      <p><strong>Name:</strong> ${esc(data.full_name ?? "Not provided", 160)}</p>
    `, { href: `${SITE}/admin/users`, label: "View Users" }),
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const eventType = String(body.event_type ?? "");
    const data = (body.data && typeof body.data === "object" ? body.data : {}) as Record<string, unknown>;

    const isPublic = (PUBLIC_EVENTS as readonly string[]).includes(eventType);
    const isAdminEvent = (ADMIN_EVENTS as readonly string[]).includes(eventType);
    if (!isPublic && !isAdminEvent) throw new HttpError(400, "Unsupported event type");
    if (isAdminEvent) await requireAdmin(req);

    if (!RESEND_API_KEY) throw new HttpError(500, "Email service not configured");

    const { subject, html } = await buildEmail(eventType, data);

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

    const ok = emailResponse.ok;
    return new Response(JSON.stringify({ success: ok }), {
      status: ok ? 200 : 502,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : "Unable to send notification";
    if (status >= 500) console.error("notify-events error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
