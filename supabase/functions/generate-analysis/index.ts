import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import {
  checkRateLimit,
  rateLimitResponse,
} from "../_shared/rateLimit.ts";

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

  const rate = await checkRateLimit(req, "generate-analysis", 10, 60);
  if (!rate.allowed) {
    return rateLimitResponse(req, rate.retryAfterSec ?? 3600);
  }

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

    const systemPrompt =
      "Tu es CyberKit, un assistant de cybersécurité bienveillant et pédagogue qui s'adresse à des indépendants et PME belges non-technophiles. Tu t'exprimes en français, avec un ton chaleureux, encourageant et non-technique. Tu ne dois jamais utiliser de jargon informatique sans l'expliquer. Tu ne dois jamais faire peur inutilement. Tu dois toujours terminer sur une note positive et encourageante. IMPORTANT: Tu ne dois jamais utiliser de formatage Markdown dans tes réponses (pas de #, **, *, _, etc.). Écris uniquement en prose fluide, en un seul paragraphe continu, sans titres ni listes.";

    const weakPointsList = weakPoints
      .map((point, index) => `${index + 1}. ${point}`)
      .join("\n");

    const userMessage = `L'utilisateur est un(e) ${profile} qui vient d'obtenir un score de ${score}/100 au diagnostic cybersécurité (niveau: ${level}).
Ses 3 points faibles identifiés sont:
${weakPointsList}
Génère une analyse personnalisée de 3 à 4 phrases maximum qui:
- reconnaît son niveau actuel sans le juger
- explique brièvement pourquoi ces points faibles sont importants pour son profil spécifique
- l'encourage à commencer par les 3 priorités identifiées
- termine sur une note positive et motivante
Ne répète pas les recommandations déjà affichées.
Sois concis, chaleureux et humain.`;

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
        system: systemPrompt,
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
