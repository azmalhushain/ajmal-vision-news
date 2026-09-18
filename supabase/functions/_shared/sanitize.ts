// Minimal server-side HTML sanitizer for AI-generated content that is later
// rendered with dangerouslySetInnerHTML on the site.
const BLOCKED_TAGS = ["script", "style", "iframe", "object", "embed", "form", "link", "meta", "base", "svg"];

export function sanitizeHtml(input: unknown): string {
  let html = String(input ?? "");

  // Drop dangerous elements with their content.
  for (const tag of BLOCKED_TAGS) {
    html = html.replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi"), "");
    html = html.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"), "");
  }

  // Remove inline event handlers (onclick=..., onerror='...', onload=x).
  html = html.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Neutralise javascript:/data: URLs in href/src/srcset/style.
  html = html.replace(
    /\s(href|src|srcset|xlink:href)\s*=\s*(?:"(\s*(?:javascript|data|vbscript):[^"]*)"|'(\s*(?:javascript|data|vbscript):[^']*)'|((?:javascript|data|vbscript):[^\s>]+))/gi,
    ' $1="#"',
  );
  html = html.replace(/\sstyle\s*=\s*(?:"[^"]*expression[^"]*"|'[^']*expression[^']*')/gi, "");

  return html;
}

export function sanitizeText(input: unknown, maxLen = 500): string {
  return String(input ?? "").replace(/<[^>]*>/g, "").slice(0, maxLen);
}
