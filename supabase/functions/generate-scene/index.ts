
// @deno-types="https://raw.githubusercontent.com/denoland/deno/v1.37.2/cli/dts/lib.deno.fetch.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function generateImageFromPrompt(prompt: string, isCharacter: boolean = false): Promise<string> {
  const falKey = Deno.env.get('FAL_KEY');
  if (!falKey) {
    throw new Error('FAL_KEY environment variable is not set');
  }

  console.log(`Generating ${isCharacter ? 'character' : 'background'} image with prompt:`, prompt);
  console.log('Using Fal API key:', falKey.substring(0, 5) + '...');  // Log first 5 chars for verification
  
  try {
    const payload = {
      model: "stable-diffusion-xl",  // Updated model name according to docs
      prompt: isCharacter 
        ? `professional portrait photograph, upper body shot facing forward, video game character portrait style of ${prompt}, photorealistic, dramatic lighting, direct eye contact with viewer, detailed face, cinematic quality, 4k, high resolution`
        : `cinematic high-quality scene of ${prompt}, atmospheric and dramatic, suitable for movie scene, wide shot, 4k, high resolution`,
      negative_prompt: "blurry, low quality, distorted, deformed, disfigured, bad anatomy, extra limbs",
      height: 1024,
      width: 1024,
      steps: isCharacter ? 30 : 20,
    };
    
    console.log('Sending request to Fal API with payload:', JSON.stringify(payload));
    
    const falResponse = await fetch('https://rest.fal.ai/api/v1/generation/stable-diffusion-xl', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await falResponse.text();
    console.log('Raw Fal API response:', responseText);

    if (!falResponse.ok) {
      throw new Error(`Fal API error (${falResponse.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Parsed Fal API response:', data);
    
    if (!data?.images?.[0]?.url) {
      throw new Error('No image URL in response: ' + JSON.stringify(data));
    }

    console.log('Successfully generated image URL:', data.images[0].url);
    return data.images[0].url;
  } catch (error) {
    console.error('Error in generateImageFromPrompt:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre, currentScene, lastChoice } = await req.json();
    console.log('Received request:', { genre, currentScene, lastChoice });
    
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
    
    Make it engaging and consistent with the ${genre} genre. For the background description, provide a vivid, detailed description of the physical location and atmosphere. Create a new character for each scene, with a unique name and appearance. Ensure you return ONLY the JSON object.`;

    console.log('Sending prompt to OpenAI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative writing assistant that generates interactive story scenes. Always respond with valid JSON that matches the requested structure exactly. Create unique and diverse characters for each scene.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await openAIResponse.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const sceneContent = data.choices[0].message.content;
    console.log('Scene content:', sceneContent);

    let parsedScene;
    try {
      parsedScene = JSON.parse(sceneContent);
    } catch (e) {
      console.error('Failed to parse scene content as JSON:', e);
      throw new Error('Generated content is not valid JSON');
    }

    if (!parsedScene.background || !parsedScene.character || !parsedScene.choices) {
      throw new Error('Generated scene is missing required fields');
    }

    // Generate background image based on the scene description
    console.log('Generating background image for:', parsedScene.background);
    const backgroundImageUrl = await generateImageFromPrompt(parsedScene.background);
    
    // Update the scene with the generated image URL
    parsedScene.background = backgroundImageUrl;

    // Always generate a new character image
    console.log('Generating character image for:', parsedScene.character.name);
    const characterDescription = `${parsedScene.character.name} - A ${genre} character with distinct features and expressions`;
    parsedScene.character.image = await generateImageFromPrompt(characterDescription, true);

    // Ensure the character has all required fields
    const requiredCharacterFields = ['name', 'voiceId', 'dialogue', 'image'];
    for (const field of requiredCharacterFields) {
      if (!parsedScene.character[field]) {
        throw new Error(`Generated scene is missing character.${field}`);
      }
    }

    console.log('Successfully generated and validated scene with images');
    return new Response(JSON.stringify({ scene: JSON.stringify(parsedScene) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-scene function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
