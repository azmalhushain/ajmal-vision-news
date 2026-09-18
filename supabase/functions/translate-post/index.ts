import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { serviceClient } from "../_shared/auth.ts";
import { sanitizeHtml, sanitizeText } from "../_shared/sanitize.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_LANGUAGES: Record<string, string> = {
  ne: "Nepali",
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const postId = typeof body.postId === "string" ? body.postId : "";
    const targetLanguage = typeof body.targetLanguage === "string" ? body.targetLanguage : "";

    if (!/^[0-9a-f-]{36}$/i.test(postId) || !ALLOWED_LANGUAGES[targetLanguage]) {
      return respond({ error: "Invalid request" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return respond({ error: "Translation service unavailable" }, 500);

    const supabase = serviceClient();

    // Source text always comes from the database — never from the request body —
    // so a caller cannot inject content into a post's translated version.
    const { data: post } = await supabase
      .from("posts")
      .select("id, title, content, excerpt, status")
      .eq("id", postId)
      .maybeSingle();

    if (!post || post.status !== "published") {
      return respond({ error: "Post not available for translation" }, 404);
    }

    const { data: existingTranslation } = await supabase
      .from("post_translations")
      .select("*")
      .eq("post_id", postId)
      .eq("language", targetLanguage)
      .maybeSingle();

    if (existingTranslation) {
      return respond(existingTranslation);
    }

    const targetLangName = ALLOWED_LANGUAGES[targetLanguage];

    const systemPrompt = `You are a professional translator. Translate content to ${targetLangName}.
Maintain original formatting and HTML tags exactly. Never add scripts, iframes, event handlers or new links.
Keep proper nouns and technical terms when appropriate. Always call the return_translation tool with your result.`;

    const userPrompt = `Translate the following to ${targetLangName}.

TITLE:
${post.title}

CONTENT:
${post.content}

EXCERPT:
${post.excerpt || ""}`;

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
      if (response.status === 429) return respond({ error: "Rate limit exceeded. Please try again later." }, 429);
      if (response.status === 402) return respond({ error: "AI credits exhausted. Please add funds." }, 402);
      console.error("AI gateway error:", response.status);
      return respond({ error: "Translation failed" }, 502);
    }

    const aiResponse = await response.json();
    const message = aiResponse.choices?.[0]?.message;
    const argsStr = message?.tool_calls?.[0]?.function?.arguments;

    let parsed: any;
    if (argsStr) {
      try {
        parsed = typeof argsStr === "string" ? JSON.parse(argsStr) : argsStr;
      } catch {
        parsed = undefined;
      }
    }
    if (!parsed && message?.content) {
      const jsonMatch = message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { /* ignore */ }
      }
    }
    if (!parsed) return respond({ error: "Translation failed" }, 502);

    // Sanitize AI-returned HTML before it is stored and rendered to readers.
    const translated = {
      post_id: postId,
      language: targetLanguage,
      translated_title: sanitizeText(parsed.translated_title || post.title, 300),
      translated_content: sanitizeHtml(parsed.translated_content || post.content),
      translated_excerpt: sanitizeText(parsed.translated_excerpt || post.excerpt || "", 1000),
    };

    const { data: saved, error: saveError } = await supabase
      .from("post_translations")
      .insert(translated)
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save translation");
      return respond(translated);
    }

    return respond(saved);
  } catch (error) {
    console.error("Translation error:", error);
    return respond({ error: "Translation failed" }, 500);
  }
});
