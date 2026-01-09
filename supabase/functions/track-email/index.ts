import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 
  0x01, 0x00, 0x3b
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("eid");
    const testId = url.searchParams.get("tid");
    const variant = url.searchParams.get("v"); // "A" or "B"
    const action = url.searchParams.get("a"); // "open" or "click"
    const link = url.searchParams.get("l"); // clicked link URL
    
    if (!emailId) {
      return new Response(TRACKING_PIXEL, {
        headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    if (action === "open") {
      // Track email open
      await supabase
        .from("email_analytics")
        .update({ opened_at: now })
        .eq("email_id", emailId)
        .is("opened_at", null);

      // Update A/B test if applicable
      if (testId && variant) {
        const columnName = variant === "A" ? "variant_a_open_count" : "variant_b_open_count";
        await supabase.rpc("increment_ab_test_counter", {
          test_id: testId,
          column_name: columnName,
        });
      }

      console.log(`Email opened: ${emailId}`);
      
      // Return tracking pixel
      return new Response(TRACKING_PIXEL, {
        headers: { 
          "Content-Type": "image/gif", 
          "Cache-Control": "no-store, no-cache, must-revalidate",
          ...corsHeaders,
        },
      });
    } else if (action === "click" && link) {
      // Track email click
      const { data: existing } = await supabase
        .from("email_analytics")
        .select("clicked_links")
        .eq("email_id", emailId)
        .single();

      const clickedLinks = existing?.clicked_links || [];
      if (Array.isArray(clickedLinks)) {
        clickedLinks.push({ url: link, clicked_at: now });
      }

      await supabase
        .from("email_analytics")
        .update({ 
          clicked_at: now,
          clicked_links: clickedLinks,
        })
        .eq("email_id", emailId);

      // Update A/B test if applicable
      if (testId && variant) {
        const columnName = variant === "A" ? "variant_a_click_count" : "variant_b_click_count";
        await supabase.rpc("increment_ab_test_counter", {
          test_id: testId,
          column_name: columnName,
        });
      }

      console.log(`Email click: ${emailId}, link: ${link}`);
      
      // Redirect to the actual link
      return new Response(null, {
        status: 302,
        headers: { 
          "Location": decodeURIComponent(link),
          ...corsHeaders,
        },
      });
    }

    // Default: return tracking pixel
    return new Response(TRACKING_PIXEL, {
      headers: { 
        "Content-Type": "image/gif", 
        "Cache-Control": "no-store",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Track email error:", error);
    return new Response(TRACKING_PIXEL, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
    });
  }
});
