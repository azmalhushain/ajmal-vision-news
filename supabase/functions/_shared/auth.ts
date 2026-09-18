// Shared auth + escaping helpers for edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Returns the authenticated user id, or null if the request has no valid JWT. */
export async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

/** Throws unless the caller is authenticated AND has the admin role. */
export async function requireAdmin(req: Request): Promise<string> {
  const userId = await getUserId(req);
  if (!userId) throw new HttpError(401, "Authentication required");
  const sb = serviceClient();
  const { data, error } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new HttpError(403, "Admin access required");
  return userId;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Escapes untrusted text before it is embedded in HTML emails. */
export function esc(value: unknown, maxLen = 2000): string {
  const s = String(value ?? "").slice(0, maxLen);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
