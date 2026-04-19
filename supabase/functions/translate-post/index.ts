import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  postId: string;
  targetLanguage: string;
  title: string;
  content: string;
  excerpt?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, targetLanguage, title, content, excerpt }: TranslateRequest = await req.json();
    
    console.log(`Translating post ${postId} to ${targetLanguage}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if translation already exists
    const { data: existingTranslation } = await supabase
      .from("post_translations")
      .select("*")
      .eq("post_id", postId)
      .eq("language", targetLanguage)
      .single();

    if (existingTranslation) {
      console.log("Translation already exists, returning cached version");
      return new Response(JSON.stringify(existingTranslation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get language name for prompt
    const languageNames: Record<string, string> = {
      ne: "Nepali",
      en: "English",
      hi: "Hindi",
      bn: "Bengali",
    };
    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Translate using Lovable AI with tool-calling for guaranteed structured output
    const systemPrompt = `You are a professional translator. Translate content to ${targetLangName}.
Maintain original formatting and HTML tags exactly. Keep proper nouns and technical terms when appropriate.
Provide natural, fluent translations. Always call the return_translation tool with your result.`;

    const userPrompt = `Translate the following to ${targetLangName}.

TITLE:
${title}

CONTENT:
${content}

EXCERPT:
${excerpt || ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_translation",
              description: "Return the translated title, content, and excerpt.",
              parameters: {
                type: "object",
                properties: {
                  translated_title: { type: "string" },
                  translated_content: { type: "string" },
                  translated_excerpt: { type: "string" },
                },
                required: ["translated_title", "translated_content", "translated_excerpt"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_translation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const message = aiResponse.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    let parsedTranslation: any;
    if (argsStr) {
      try {
        parsedTranslation = typeof argsStr === "string" ? JSON.parse(argsStr) : argsStr;
      } catch (e) {
        console.error("Failed to parse tool arguments:", argsStr);
      }
    }

    // Fallback: try to parse content as JSON if no tool call
    if (!parsedTranslation && message?.content) {
      const jsonMatch = message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedTranslation = JSON.parse(jsonMatch[0]);
        } catch {
          // ignore
        }
      }
    }

    if (!parsedTranslation) {
      console.error("No valid translation in AI response:", JSON.stringify(aiResponse).slice(0, 500));
      throw new Error("Failed to parse translation response");
    }

    // Save translation to database
    const { data: savedTranslation, error: saveError } = await supabase
      .from("post_translations")
      .insert({
        post_id: postId,
        language: targetLanguage,
        translated_title: parsedTranslation.translated_title || title,
        translated_content: parsedTranslation.translated_content || content,
        translated_excerpt: parsedTranslation.translated_excerpt || excerpt,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save translation:", saveError);
      // Return the translation even if we couldn't save it
      return new Response(JSON.stringify({
        post_id: postId,
        language: targetLanguage,
        translated_title: parsedTranslation.translated_title,
        translated_content: parsedTranslation.translated_content,
        translated_excerpt: parsedTranslation.translated_excerpt,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Translation saved successfully for post ${postId}`);

    return new Response(JSON.stringify(savedTranslation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Translation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
