import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import { requireAdminUser, serviceClient } from "../_shared/adminAuth.ts";

const VALID_STATUS = new Set(["new", "read", "replied"]);

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const cors = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  const auth = await requireAdminUser(req);
  if ("error" in auth) return auth.error;

  if (req.method !== "POST") {
    return json({ error: "Méthode non autorisée" }, 405);
  }

  try {
    const body = await req.json();
    const supabase = serviceClient();

    if (body.action === "update") {
      const { id, status } = body;
      if (!id || !VALID_STATUS.has(status)) {
        return json({ error: "id et status requis" }, 400);
      }
      const { error } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const messages = (data ?? []).map((row) => ({
      ...row,
      status: VALID_STATUS.has(row.status) ? row.status : "new",
    }));

    return json({ messages });
  } catch (err) {
    console.error("admin-contact-messages:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});
