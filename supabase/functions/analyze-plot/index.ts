
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const {
      currentScene,
      plotEvents,
      characters,
      tension,
      storyPhase,
      currentThemes,
      genre
    } = await req.json()

    // Create a detailed prompt for the AI
    const systemPrompt = `You are an expert storyteller and plot supervisor AI. Analyze the current story state and make creative decisions to keep the narrative engaging and coherent.

Current state:
- Genre: ${genre}
- Story phase: ${storyPhase}
- Current tension: ${tension}/100
- Themes: ${currentThemes.join(', ')}

Recent events:
${plotEvents.map(e => `- ${e.type}: ${e.content} (Impact: ${e.severity})`).join('\n')}

Character states:
${Object.values(characters).map(c => 
  `- ${c.name}: Mood(${c.stats.mood}), Trust(${c.stats.trust}), Health(${c.stats.health})`
).join('\n')}

Current scene:
${JSON.stringify(currentScene, null, 2)}

Analyze this state and provide:
1. Should the story end? If yes, provide a reason.
2. Suggested tension level (0-100)
3. Suggested story phase
4. Plot suggestions for the next scene
5. Any new characters that should be introduced
6. Required characters for the next scene

Format your response as a valid JSON object.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze the current plot state and provide suggestions.' }
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-plot function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
