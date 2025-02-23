
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

    const result = await fal.subscribe('110602490-fast-sdxl', {
      input
    });

    if (!result?.images?.[0]?.url) {
      throw new Error('No image URL in response');
    }

    return result.images[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
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
    
    // Create initial scene if there's no current scene
    const isFirstScene = !currentScene;
    
    let backgroundPrompt = isFirstScene
      ? `A ${genre} scene setting suitable for the opening of a story`
      : `A ${genre} scene that would follow after ${lastChoice || 'the previous events'}`;

    const backgroundUrl = await generateImageFromPrompt(backgroundPrompt);
    console.log('Generated background URL:', backgroundUrl);

    // Generate character if it's the first scene
    let characterData;
    if (isFirstScene) {
      const characterPrompt = `A protagonist suitable for a ${genre} story`;
      const characterImageUrl = await generateImageFromPrompt(characterPrompt, true);
      characterData = {
        id: "char1",
        name: "Alex",
        image: characterImageUrl,
        gender: Math.random() > 0.5 ? "male" : "female",
        currentDialogue: `This is where our ${genre} story begins...`
      };
    } else {
      // Use existing character from current scene
      characterData = currentScene.characters[0];
      characterData.currentDialogue = `What should we do next in this ${genre} tale?`;
    }

    const sceneData = {
      background: backgroundUrl,
      characters: [characterData],
      choices: [
        `Continue exploring this ${genre} adventure`,
        `Take a different approach to the story`
      ]
    };

    console.log('Generated scene data:', sceneData);

    return new Response(JSON.stringify({ scene: JSON.stringify(sceneData) }), {
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
