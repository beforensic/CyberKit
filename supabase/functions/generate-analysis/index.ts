import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  enforceAiRateLimits,
  enforceAllowedOrigin,
  requireSupabaseJwt,
} from "../_shared/aiAccess.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import { GENERATE_ANALYSIS_SYSTEM_PROMPT } from "../_shared/aiPrompts.ts";

interface AnalysisRequest {
  profile: string;
  score: number;
  level: string;
  weakPoints: string[];
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

  const originError = enforceAllowedOrigin(req);
  if (originError) return originError;

  const authError = await requireSupabaseJwt(req);
  if (authError) return authError;

  const rateError = await enforceAiRateLimits(req, "generate-analysis");
  if (rateError) return rateError;

  try {
    const { profile, score, level, weakPoints: rawWeakPoints }: AnalysisRequest =
      await req.json();

    if (!profile || typeof score !== "number" || !level) {
      return new Response(
        JSON.stringify({ error: "Missing profile, score or level" }),
        {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    }

    if (score < 0 || score > 100 || profile.length > 80 || level.length > 40) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    }

    const weakPoints = Array.isArray(rawWeakPoints) && rawWeakPoints.length > 0
      ? rawWeakPoints
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .slice(0, 5)
        .map((p) => p.trim().slice(0, 300))
      : ["Renforcer vos pratiques de cybersécurité au quotidien"];

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const weakPointsList = weakPoints
      .map((point, index) => `${index + 1}. ${point}`)
      .join("\n");

    const userMessage = `L'utilisateur est un(e) ${profile} qui vient d'obtenir un score de ${score}/100 au diagnostic cybersécurité (niveau : ${level}).
Ses points faibles identifiés sont :
${weakPointsList}
Rédigez une analyse personnalisée de 3 à 4 phrases maximum qui :
- reconnaît son niveau actuel sans le juger
- explique brièvement pourquoi ces points faibles sont importants pour son profil
- l'encourage à commencer par les priorités identifiées
- se termine sur une note positive et motivante
Ne répétez pas les recommandations déjà affichées.
Vouvoyez l'utilisateur (« vous », « votre »). Soyez concis, chaleureux et humain.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: GENERATE_ANALYSIS_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;

    return new Response(
      JSON.stringify({ analysis: analysisText }),
      {
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error generating analysis:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate analysis" }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }
});
