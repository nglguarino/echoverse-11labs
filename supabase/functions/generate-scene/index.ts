
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function generateImageFromPrompt(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `A cinematic, high-quality scene of ${prompt}. The image should be atmospheric and dramatic, suitable for a movie scene.`,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  return data.data[0].url;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { genre, currentScene, lastChoice } = await req.json()
    console.log('Received request:', { genre, currentScene, lastChoice })
    
    const prompt = `Generate the next scene for an interactive ${genre} story. Format the response as a JSON object with the following structure:
    {
      "background": "description of the scene setting",
      "character": {
        "name": "character name",
        "voiceId": "21m00Tcm4TlvDq8ikWAM",
        "dialogue": "character's dialogue",
        "image": "URL for a character image"
      },
      "choices": ["choice 1", "choice 2"]
    }

    ${currentScene ? `Previous scene: ${JSON.stringify(currentScene)}` : 'This is the start of the story.'}
    ${lastChoice ? `Player chose: ${lastChoice}` : ''}
    
    Make it engaging and consistent with the ${genre} genre. For the background description, provide a vivid, detailed description of the physical location and atmosphere. Ensure you return ONLY the JSON object.`

    console.log('Sending prompt to OpenAI')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative writing assistant that generates interactive story scenes. Always respond with valid JSON that matches the requested structure exactly.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      throw new Error('Failed to get response from OpenAI')
    }

    const data = await response.json()
    console.log('OpenAI response:', data)

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI')
    }

    const sceneContent = data.choices[0].message.content
    console.log('Scene content:', sceneContent)

    // Try to parse the scene content as JSON
    let parsedScene
    try {
      parsedScene = JSON.parse(sceneContent)
    } catch (e) {
      console.error('Failed to parse scene content as JSON:', e)
      throw new Error('Generated content is not valid JSON')
    }

    // Validate the scene structure
    if (!parsedScene.background || !parsedScene.character || !parsedScene.choices) {
      throw new Error('Generated scene is missing required fields')
    }

    // Generate background image based on the scene description
    console.log('Generating background image for:', parsedScene.background)
    const backgroundImageUrl = await generateImageFromPrompt(parsedScene.background)
    
    // Update the scene with the generated image URL
    parsedScene.background = backgroundImageUrl

    // Generate character image if needed
    if (!parsedScene.character.image || parsedScene.character.image.startsWith('URL')) {
      console.log('Generating character image for:', parsedScene.character.name)
      const characterImagePrompt = `A portrait of ${parsedScene.character.name}, a character in a ${genre} story`
      parsedScene.character.image = await generateImageFromPrompt(characterImagePrompt)
    }

    // Ensure the character has all required fields
    const requiredCharacterFields = ['name', 'voiceId', 'dialogue', 'image']
    for (const field of requiredCharacterFields) {
      if (!parsedScene.character[field]) {
        throw new Error(`Generated scene is missing character.${field}`)
      }
    }

    // If we get here, the scene is valid
    console.log('Successfully generated and validated scene with images')
    return new Response(JSON.stringify({ scene: JSON.stringify(parsedScene) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in generate-scene function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
