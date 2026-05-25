import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import {
  checkRateLimit,
  rateLimitResponse,
} from "../_shared/rateLimit.ts";

const MIN_FORM_DELAY_MS = 3000;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
  formLoadedAt?: number;
  quiz_score?: number | null;
  theme_interest?: string | null;
}

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const cors = getCorsHeaders(req);

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const rate = await checkRateLimit(req, "submit-contact", 3, 60);
  if (!rate.allowed) {
    return rateLimitResponse(req, rate.retryAfterSec ?? 3600);
  }

  try {
    const body: ContactPayload = await req.json();

    if (body.website?.trim()) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const loadedAt = typeof body.formLoadedAt === "number"
      ? body.formLoadedAt
      : 0;
    if (loadedAt > 0 && Date.now() - loadedAt < MIN_FORM_DELAY_MS) {
      return new Response(
        JSON.stringify({ error: "Envoi trop rapide. Réessayez." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (
      !name || !email || !subject || !message ||
      name.length > MAX_NAME ||
      email.length > MAX_EMAIL ||
      subject.length > MAX_SUBJECT ||
      message.length > MAX_MESSAGE
    ) {
      return new Response(
        JSON.stringify({ error: "Champs invalides ou manquants." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Adresse email invalide." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase service configuration missing");
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const row: Record<string, unknown> = {
      name,
      email,
      subject,
      message,
      status: "new",
    };

    if (typeof body.quiz_score === "number" && Number.isFinite(body.quiz_score)) {
      row.quiz_score = Math.round(body.quiz_score);
    }
    if (body.theme_interest?.trim()) {
      row.theme_interest = body.theme_interest.trim().slice(0, 200);
    }

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert([row]);

    if (insertError) {
      console.error("contact insert:", insertError.message);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("submit-contact error:", error);
    return new Response(
      JSON.stringify({
        error: "Une erreur s'est produite. Veuillez réessayer ou utiliser l'email direct.",
      }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }
});
