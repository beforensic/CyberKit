import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// 1. Définition des headers CORS ultra-complets
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Ou 'https://www.cyberkit.be' pour plus de sécurité
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 2. GESTION DU PREFLIGHT (C'est ce qui bloque actuellement !)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200, // On renvoie bien un status OK
      headers: corsHeaders
    })
  }

  try {
    const { systemPrompt, messages } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      throw new Error("La clé API OpenAI n'est pas configurée dans Supabase.")
    }

    // 3. Appel à OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur OpenAI:', errorData);
      throw new Error("L'IA n'a pas pu répondre.");
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content

    // 4. Réponse au client avec les headers CORS
    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur Function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})