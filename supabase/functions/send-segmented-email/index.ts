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
  recipientEmails?: string[];
  testId?: string; // A/B test ID
  variant?: string; // "A" or "B" for A/B testing
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
      recipientEmails,
      testId,
      variant
    }: SendEmailRequest = await req.json();

    console.log("Sending segmented email:", { segment, interests, minEngagementScore, testId, variant });

    let recipients: string[] = [];

    if (recipientEmails && recipientEmails.length > 0) {
      recipients = recipientEmails;
    } else {
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

    const batchSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    // Update A/B test sent count if applicable
    if (testId && variant) {
      const columnName = variant === "A" ? "variant_a_sent_count" : "variant_b_sent_count";
      await supabase.rpc("increment_ab_test_counter", {
        test_id: testId,
        column_name: columnName,
      });
    }

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Generate unique email IDs for each recipient for tracking
      for (const recipientEmail of batch) {
        try {
          const emailId = crypto.randomUUID();
          const trackingBaseUrl = `${supabaseUrl}/functions/v1/track-email`;
          
          // Build tracking URLs
          const openTrackingUrl = `${trackingBaseUrl}?eid=${emailId}&a=open${testId ? `&tid=${testId}&v=${variant}` : ''}`;
          const unsubscribeUrl = `https://ajmal-vision-news.lovable.app/preferences?email=${encodeURIComponent(recipientEmail)}`;
          
          // Function to wrap links with click tracking
          const wrapLinksWithTracking = (htmlContent: string): string => {
            return htmlContent.replace(
              /href="(https?:\/\/[^"]+)"/g,
              (match, url) => {
                if (url.includes('track-email') || url.includes('unsubscribe')) return match;
                const trackUrl = `${trackingBaseUrl}?eid=${emailId}&a=click&l=${encodeURIComponent(url)}${testId ? `&tid=${testId}&v=${variant}` : ''}`;
                return `href="${trackUrl}"`;
              }
            );
          };

          const wrappedContent = wrapLinksWithTracking(content);

          const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${subject}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1a365d 0%, #2b4a7c 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Ajmal Vision News</h1>
                  <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 14px;">Mayor of Bhokraha Narsingh Municipality</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px; background: #ffffff;">
                  ${wrappedContent}
                </div>
                
                <!-- Footer -->
                <div style="padding: 20px 30px; background: #1a365d; text-align: center;">
                  <p style="color: #a0aec0; font-size: 12px; margin: 0 0 10px 0;">
                    You received this email because you subscribed to Ajmal Vision News.
                  </p>
                  <p style="margin: 0;">
                    <a href="${unsubscribeUrl}" style="color: #63b3ed; font-size: 12px; text-decoration: underline;">
                      Manage Preferences
                    </a>
                    <span style="color: #4a5568; margin: 0 10px;">|</span>
                    <a href="https://ajmal-vision-news.lovable.app" style="color: #63b3ed; font-size: 12px; text-decoration: underline;">
                      Visit Website
                    </a>
                  </p>
                </div>
              </div>
              
              <!-- Open Tracking Pixel (1x1 transparent image) -->
              <img src="${openTrackingUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />
            </body>
            </html>
          `;

          const emailResponse = await resend.emails.send({
            from: "Ajmal Vision News <onboarding@resend.dev>",
            to: [recipientEmail],
            subject: subject,
            html: emailHtml,
          });

          sentCount++;

          // Track analytics
          await supabase.from("email_analytics").insert({
            email_id: emailId,
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

        } catch (emailError: any) {
          console.error(`Error sending to ${recipientEmail}:`, emailError);
          errors.push(`${recipientEmail}: ${emailError.message}`);
        }
      }
      
      console.log(`Batch sent: ${batch.length} emails`);
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
