
// @deno-types="https://raw.githubusercontent.com/denoland/deno/v1.37.2/cli/dts/lib.deno.fetch.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import * as fal from 'npm:@fal-ai/serverless-client'

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
  
  try {
    fal.config({
      credentials: falKey
    });

    console.log('Initialized Fal client, sending request...');

    const input = {
      prompt: isCharacter 
        ? `professional portrait photograph, upper body shot facing forward, video game character portrait style of ${prompt}, photorealistic, dramatic lighting, direct eye contact with viewer, detailed face, cinematic quality, 4k, high resolution`
        : `cinematic high-quality scene of ${prompt}, atmospheric and dramatic, suitable for movie scene, wide shot, 4k, high resolution`,
      negative_prompt: "blurry, low quality, distorted, deformed, disfigured, bad anatomy, extra limbs",
      num_inference_steps: isCharacter ? 30 : 20,
      scheduler: "DPM++ 2M",
      seed: Math.floor(Math.random() * 1000000)
    };

    console.log('Sending request with input:', input);

    const result = await fal.subscribe('110602490-fast-sdxl', {
      input
    });

    console.log('Received response from Fal:', result);

    if (!result?.images?.[0]?.url) {
      console.error('Invalid response format:', result);
      throw new Error('No image URL in response');
    }

    console.log('Successfully generated image URL:', result.images[0].url);
    return result.images[0].url;
  } catch (error) {
    console.error('Detailed error in generateImageFromPrompt:', {
      error: error.toString(),
      stack: error.stack,
      name: error.name,
      message: error.message
    });
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre, currentScene, lastChoice, storyCharacter } = await req.json();
    console.log('Received request:', { genre, currentScene, lastChoice, storyCharacter });
    
    // Modify the prompt to maintain character consistency and ensure proper gender
    const characterContext = storyCharacter 
      ? `Continue the story with ${storyCharacter.name}, who is a ${storyCharacter.gender} character. Maintain their personality, gender, and appearance exactly as established.`
      : 'Create a new character for this story. Clearly specify if they are male or female.';
    
    const prompt = `Generate the next scene for an interactive ${genre} story. ${characterContext} Format the response as a JSON object with the following structure:
    {
      "background": "description of the scene setting",
      "character": {
        "name": "${storyCharacter?.name || '[character name]'}",
        "voiceId": "${storyCharacter?.gender === 'female' ? 'EXAVITQu4vr4xnSDxMaL' : '21m00Tcm4TlvDq8ikWAM'}",
        "dialogue": "character's dialogue",
        "image": "${storyCharacter?.image || '[character image url]'}",
        "gender": "${storyCharacter?.gender || 'male'}"
      },
      "choices": ["choice 1", "choice 2"]
    }

    ${currentScene ? `Previous scene: ${JSON.stringify(currentScene)}` : 'This is the start of the story.'}
    ${lastChoice ? `Player chose: ${lastChoice}` : ''}
    
    Make it engaging and consistent with the ${genre} genre. For the background description, provide a vivid, detailed description of the physical location and atmosphere. Ensure you return ONLY the JSON object.`;

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
            content: 'You are a creative writing assistant that generates interactive story scenes. Always respond with valid JSON that matches the requested structure exactly. Create unique and diverse scenes while maintaining character consistency.'
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
      
      // Force correct voice ID based on gender
      const gender = storyCharacter?.gender || parsedScene.character.gender;
      parsedScene.character.voiceId = gender === 'female' ? 'EXAVITQu4vr4xnSDxMaL' : '21m00Tcm4TlvDq8ikWAM';
      
      if (storyCharacter) {
        // Ensure character consistency
        parsedScene.character.name = storyCharacter.name;
        parsedScene.character.image = storyCharacter.image;
        parsedScene.character.gender = storyCharacter.gender;
      }
      
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
    parsedScene.background = backgroundImageUrl;

    // Only generate new character image if there's no existing character
    if (!storyCharacter) {
      console.log('Generating character image for:', parsedScene.character.name);
      const characterDescription = `${parsedScene.character.name} - A ${genre} character with distinct features and expressions`;
      parsedScene.character.image = await generateImageFromPrompt(characterDescription, true);
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
