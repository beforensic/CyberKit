import { jwtVerify } from "https://deno.land/x/jose@v5.9.6/index.ts";
import { getCorsHeaders, isAllowedOrigin } from "./cors.ts";
import { checkRateLimit, rateLimitResponse } from "./rateLimit.ts";

const AI_RATE_LIMITS = {
  "generate-analysis": [
    { bucket: "generate-analysis:global", max: 120, windowMinutes: 24 * 60, scope: "global" as const },
    { bucket: "generate-analysis", max: 5, windowMinutes: 60, scope: "ip" as const },
  ],
  "explain-keyword": [
    { bucket: "explain-keyword:global", max: 400, windowMinutes: 24 * 60, scope: "global" as const },
    { bucket: "explain-keyword", max: 20, windowMinutes: 60, scope: "ip" as const },
  ],
};

function jsonError(req: Request, message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function validateTokenClaims(payload: Record<string, unknown>): boolean {
  const projectRef = Deno.env.get("SUPABASE_URL")
    ?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const ref = typeof payload.ref === "string" ? payload.ref : undefined;
  if (projectRef && ref && ref !== projectRef) return false;

  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (exp > 0 && exp * 1000 < Date.now()) return false;

  const role = payload.role;
  return role === "anon" || role === "authenticated";
}

async function verifySupabaseAccessToken(token: string): Promise<boolean> {
  const payload = decodeJwtPayload(token);
  if (!payload || !validateTokenClaims(payload)) return false;

  const secret = Deno.env.get("SUPABASE_JWT_SECRET") ??
    Deno.env.get("JWT_SECRET") ??
    Deno.env.get("SB_JWT_SECRET");

  if (!secret) {
    return payload.iss === "supabase" || typeof payload.sub === "string";
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return payload.iss === "supabase";
  }
}

/** Rejects browser calls from origins outside the CyberKit allowlist. */
export function enforceAllowedOrigin(req: Request): Response | null {
  if (!isAllowedOrigin(req)) {
    return jsonError(req, "Origine non autorisée", 403);
  }
  return null;
}

/**
 * Requires a valid Supabase JWT (anon or authenticated session).
 * Compatible with publishable anon keys (`iss: "supabase"`).
 */
export async function requireSupabaseJwt(req: Request): Promise<Response | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return jsonError(req, "Authentification requise", 401);
  }

  const token = auth.slice(7).trim();
  if (!token || !(await verifySupabaseAccessToken(token))) {
    return jsonError(req, "Session invalide", 401);
  }

  return null;
}

export async function enforceAiRateLimits(
  req: Request,
  functionName: keyof typeof AI_RATE_LIMITS,
): Promise<Response | null> {
  for (const limit of AI_RATE_LIMITS[functionName]) {
    const rate = await checkRateLimit(
      req,
      limit.bucket,
      limit.max,
      limit.windowMinutes,
      { scope: limit.scope, failClosed: true },
    );
    if (!rate.allowed) {
      return rateLimitResponse(req, rate.retryAfterSec ?? 3600);
    }
  }
  return null;
}
