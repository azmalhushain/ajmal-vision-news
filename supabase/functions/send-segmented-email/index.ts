import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendEmailRequest {
  segment?: string;
  interests?: string[];
  minEngagementScore?: number;
  subject: string;
  content: string;
  recipientEmails?: string[]; // Optional: send to specific emails
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      segment, 
      interests, 
      minEngagementScore, 
      subject, 
      content,
      recipientEmails 
    }: SendEmailRequest = await req.json();

    console.log("Sending segmented email:", { segment, interests, minEngagementScore });

    let recipients: string[] = [];

    if (recipientEmails && recipientEmails.length > 0) {
      recipients = recipientEmails;
    } else {
      // Build query based on segmentation criteria
      let query = supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("is_active", true);

      if (segment && segment !== "all") {
        query = query.eq("segment", segment);
      }

      if (interests && interests.length > 0) {
        query = query.overlaps("interests", interests);
      }

      if (minEngagementScore !== undefined && minEngagementScore > 0) {
        query = query.gte("engagement_score", minEngagementScore);
      }

      const { data: subscribers, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      recipients = subscribers?.map(s => s.email) || [];
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No subscribers match the criteria",
          sent: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email to ${recipients.length} recipients`);

    // Send emails in batches (Resend has a limit)
    const batchSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Ajmal Vision News <onboarding@resend.dev>",
          to: batch,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1a365d 0%, #2b4a7c 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ajmal Vision News</h1>
              </div>
              <div style="padding: 30px; background: #f8fafc;">
                ${content}
              </div>
              <div style="padding: 20px; background: #1a365d; text-align: center;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                  You received this email because you subscribed to Ajmal Vision News.<br>
                  <a href="#" style="color: #63b3ed;">Unsubscribe</a>
                </p>
              </div>
            </div>
          `,
        });

        sentCount += batch.length;
        console.log(`Batch sent: ${batch.length} emails`);

        // Track analytics
        for (const recipientEmail of batch) {
          await supabase.from("email_analytics").insert({
            email_id: emailResponse.data?.id || crypto.randomUUID(),
            recipient_email: recipientEmail,
            sent_at: new Date().toISOString(),
          });

          // Update engagement
          await supabase
            .from("newsletter_subscribers")
            .update({ 
              last_engagement_at: new Date().toISOString(),
            })
            .eq("email", recipientEmail);
        }

      } catch (batchError: any) {
        console.error("Batch send error:", batchError);
        errors.push(batchError.message);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${sentCount} subscribers`,
        sent: sentCount,
        total: recipients.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Segmented email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
