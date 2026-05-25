import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "./cors.ts";

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

export async function checkRateLimit(
  req: Request,
  bucket: string,
  maxRequests: number,
  windowMinutes: number,
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    console.error("Rate limit skipped: missing Supabase env");
    return { allowed: true };
  }

  const ip = await hashIp(getClientIp(req));
  const bucketKey = `${bucket}:${ip}`;
  const windowMs = windowMinutes * 60 * 1000;
  const now = Date.now();
  const windowStart = new Date(
    Math.floor(now / windowMs) * windowMs,
  ).toISOString();

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error: readError } = await supabase
    .from("edge_rate_limits")
    .select("request_count, window_start")
    .eq("bucket_key", bucketKey)
    .maybeSingle();

  if (readError) {
    console.error("Rate limit read error:", readError.message);
    return { allowed: true };
  }

  if (
    existing &&
    existing.window_start === windowStart &&
    existing.request_count >= maxRequests
  ) {
    const windowEnd = Math.floor(now / windowMs) * windowMs + windowMs;
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((windowEnd - now) / 1000)),
    };
  }

  const nextCount =
    existing && existing.window_start === windowStart
      ? existing.request_count + 1
      : 1;

  const { error: upsertError } = await supabase.from("edge_rate_limits").upsert(
    {
      bucket_key: bucketKey,
      window_start: windowStart,
      request_count: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "bucket_key" },
  );

  if (upsertError) {
    console.error("Rate limit write error:", upsertError.message);
    return { allowed: true };
  }

  return { allowed: true };
}

export function rateLimitResponse(
  req: Request,
  retryAfterSec: number,
): Response {
  return new Response(
    JSON.stringify({ error: "Trop de requêtes. Réessayez plus tard." }),
    {
      status: 429,
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}
