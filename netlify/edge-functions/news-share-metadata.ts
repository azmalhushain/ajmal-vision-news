const BOT_USER_AGENT = /bot|crawler|spider|facebookexternalhit|facebot|whatsapp|telegrambot|linkedinbot|discordbot|twitterbot|slackbot|skypeuripreview|google-inspectiontool|bingpreview|applebot/i;
const POST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface NetlifyContext {
  next: () => Promise<Response>;
}

export default async (request: Request, context: NetlifyContext): Promise<Response> => {
  const incomingUrl = new URL(request.url);
  const postId = incomingUrl.searchParams.get("post");
  const userAgent = request.headers.get("user-agent") || "";

  // Let people use the React News page normally; only crawlers need server HTML.
  if (!postId || !POST_ID_PATTERN.test(postId) || !BOT_USER_AGENT.test(userAgent)) {
    return context.next();
  }

  const projectUrl = Netlify.env.get("VITE_SUPABASE_URL") || Netlify.env.get("SUPABASE_URL");
  const publishableKey = Netlify.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || Netlify.env.get("SUPABASE_ANON_KEY");
  if (!projectUrl || !publishableKey) {
    console.error("News share metadata proxy is missing its public connection settings.");
    return new Response("News metadata is temporarily unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const metadataUrl = new URL("/functions/v1/og-image", projectUrl);
  metadataUrl.searchParams.set("post", postId);
  const metadataResponse = await fetch(metadataUrl, {
    method: request.method,
    headers: {
      "apikey": publishableKey,
      "Authorization": `Bearer ${publishableKey}`,
      "User-Agent": userAgent,
      "Accept": "text/html,application/xhtml+xml",
    },
  });

  const headers = new Headers();
  for (const name of ["content-type", "content-language", "cache-control", "x-content-type-options"]) {
    const value = metadataResponse.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(request.method === "HEAD" ? null : metadataResponse.body, {
    status: metadataResponse.status,
    headers,
  });
};