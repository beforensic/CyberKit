import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import {
  checkRateLimit,
  rateLimitResponse,
} from "../_shared/rateLimit.ts";

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

  const rate = await checkRateLimit(req, "explain-keyword", 30, 60);
  if (!rate.allowed) {
    return rateLimitResponse(req, rate.retryAfterSec ?? 3600);
  }

  try {
    const { keyword } = await req.json();

    if (!keyword || typeof keyword !== "string") {
      return new Response(
        JSON.stringify({ error: "Keyword is required" }),
        {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    }

    const trimmed = keyword.trim().slice(0, 80);
    if (trimmed.length < 2) {
      return new Response(
        JSON.stringify({ error: "Keyword too short" }),
        {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const systemPrompt =
      "Tu es CyberKit, un assistant de cybersécurité pédagogue qui s'adresse à des indépendants et PME belges non-technophiles. Tu t'exprimes en français, avec un ton simple et chaleureux. Tu ne dois jamais utiliser de jargon sans l'expliquer. Tu ne dois jamais utiliser de formatage Markdown (pas de #, **, *, _, etc.). Écris uniquement en texte brut.";

    const userMessage =
      `Explique le terme de cybersécurité '${trimmed}' en 2 phrases maximum, en langage simple et accessible à un non-technicien belge. Sois concis et pratique.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    const explanation = result.content[0].text;

    return new Response(
      JSON.stringify({ explanation }),
      {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in explain-keyword function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }
});
