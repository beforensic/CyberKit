import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // GESTION DU PREFLIGHT (Indispensable pour le navigateur)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { systemPrompt, messages } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY') // On utilise le nom de secret actuel

    console.log("Appel d'Anthropic en cours...");

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.filter((m: any) => m.role !== 'system'),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Détails erreur Anthropic:", data);
      throw new Error(data.error?.message || "Erreur API Anthropic");
    }

    return new Response(
      JSON.stringify({ message: data.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans la fonction:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})