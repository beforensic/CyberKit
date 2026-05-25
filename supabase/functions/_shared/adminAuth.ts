import { createClient, type User } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  return appRole === "admin" || userRole === "admin";
}

export async function requireAdminUser(
  req: Request,
): Promise<{ user: User } | { error: Response }> {
  const token = getBearerToken(req);
  if (!token) {
    return {
      error: new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return {
      error: new Response(JSON.stringify({ error: "Configuration serveur" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return {
      error: new Response(JSON.stringify({ error: "Session invalide" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  if (!isAdminUser(user)) {
    return {
      error: new Response(
        JSON.stringify({
          error: "Accès admin requis (app_metadata.role = admin). Reconnectez-vous après grant_cyberkit_admin.sql.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      ),
    };
  }

  return { user };
}

export function serviceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
