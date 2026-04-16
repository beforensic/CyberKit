import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { systemPrompt, messages } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    console.log("Tentative d'appel à Anthropic (Claude 3.5 Sonnet)...");

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        // Changement de modèle pour plus de fiabilité
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: systemPrompt,
        // On s'assure que les messages sont bien formattés
        messages: messages.filter((m: any) => m.role === 'user' || m.role === 'assistant'),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Erreur détaillée Anthropic:", JSON.stringify(data));
      throw new Error(data.error?.message || "Erreur API Anthropic");
    }

    return new Response(
      JSON.stringify({ message: data.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur finale:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})