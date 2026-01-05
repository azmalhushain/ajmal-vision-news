import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number; type: "email" | "phone" }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, phone, otp, type = "email" } = await req.json();
    console.log(`OTP action: ${action}, type: ${type}`);

    if (action === "send") {
      const generatedOtp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
      const identifier = type === "email" ? email : phone;

      if (!identifier) {
        throw new Error(`${type === "email" ? "Email" : "Phone"} is required`);
      }

      // Store OTP
      otpStore.set(identifier, { otp: generatedOtp, expiresAt, type });

      if (type === "email") {
        // Send OTP via email
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        
        if (!RESEND_API_KEY) {
          console.error("RESEND_API_KEY not configured");
          throw new Error("Email service not configured");
        }

        const emailResponse = await resend.emails.send({
          from: "Ajmal Vision News <onboarding@resend.dev>",
          to: [email],
          subject: "Your Verification Code - Ajmal Vision News",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a365d; margin: 0;">Ajmal Vision News</h1>
              </div>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 20px;">
                <h2 style="color: white; margin: 0 0 10px 0;">Your Verification Code</h2>
                <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a365d;">${generatedOtp}</span>
                </div>
              </div>
              <p style="color: #4a5568; font-size: 14px; text-align: center;">
                This code will expire in 10 minutes.<br>
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          `,
        });

        console.log("Email OTP sent:", emailResponse);
      } else if (type === "phone") {
        // For phone OTP, we would typically use Twilio or similar
        // Since we don't have Twilio configured, we'll return the OTP for demo purposes
        // In production, integrate with SMS provider
        console.log(`Phone OTP for ${phone}: ${generatedOtp}`);
        
        // For demo, we'll just log it - in production use Twilio
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "OTP sent to phone",
            // Only for demo/testing - remove in production
            demo_otp: generatedOtp 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "OTP sent successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "verify") {
      const identifier = type === "email" ? email : phone;
      
      if (!identifier || !otp) {
        throw new Error("Identifier and OTP are required");
      }

      const storedData = otpStore.get(identifier);

      if (!storedData) {
        return new Response(
          JSON.stringify({ success: false, error: "No OTP found. Please request a new code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(identifier);
        return new Response(
          JSON.stringify({ success: false, error: "OTP has expired. Please request a new code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (storedData.otp !== otp) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid OTP. Please check and try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // OTP verified successfully
      otpStore.delete(identifier);
      
      return new Response(
        JSON.stringify({ success: true, message: "OTP verified successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");

  } catch (error: any) {
    console.error("OTP error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
