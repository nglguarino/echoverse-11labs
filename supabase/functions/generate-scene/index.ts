
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

async function detectLocationChange(prevScene: any, newScene: string): Promise<boolean> {
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: 'You are a story analyzer that detects location changes in narrative scenes. Return only "true" if the location has significantly changed or "false" if it has not.'
        },
        {
          role: 'user',
          content: `Previous scene: ${JSON.stringify(prevScene)}\nNew scene: ${newScene}\n\nHas the location changed significantly? Answer only with true or false.`
        }
      ],
    }),
  });

  const data = await openAIResponse.json();
  const result = data.choices[0].message.content.toLowerCase().trim() === 'true';
  console.log('Location change detection result:', result);
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre, currentScene, lastChoice, storyCharacter, storyCharacters } = await req.json();
    console.log('Received request with:', { storyCharacter, storyCharacters });
    
    const characterContext = storyCharacter 
      ? `Continue the story with ${storyCharacter.name} as the main character, who is a ${storyCharacter.gender} character. Keep their gender as ${storyCharacter.gender}.`
      : 'Create a new character for this story. Clearly specify if they are male or female.';
    
    const existingCharactersContext = storyCharacters?.length 
      ? `The story also includes these characters: ${storyCharacters.map(c => `${c.name} (${c.gender})`).join(', ')}.` 
      : '';
    
    const prompt = `Generate the next scene for an interactive ${genre} story. ${characterContext} ${existingCharactersContext}

    Format the response as a JSON object with the following structure:
    {
      "background": "description of the scene setting",
      "character": {
        "name": "${storyCharacter?.name || '[character name]'}",
        "dialogue": "character's dialogue",
        "image": "${storyCharacter?.image || '[character image url]'}",
        "gender": "${storyCharacter?.gender || 'male'}"
      },
      "otherCharacters": [
        {
          "name": "character name",
          "dialogue": "character's dialogue",
          "image": "character image url",
          "gender": "male or female"
        }
      ],
      "choices": ["choice 1", "choice 2"]
    }

    ${currentScene ? `Previous scene: ${JSON.stringify(currentScene)}` : 'This is the start of the story.'}
    ${lastChoice ? `Player chose: ${lastChoice}` : ''}
    
    Make it engaging and consistent with the ${genre} genre. If new characters are introduced in the dialogue or player's choice, include them in the otherCharacters array with detailed descriptions for their appearance. If the story involves moving to a new location, make sure to describe it in detail. Characters can have conversations and interactions with each other. Ensure you return ONLY the JSON object.`;

    console.log('Sending prompt to OpenAI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a creative writing assistant that generates interactive story scenes with multiple characters. Always respond with valid JSON that matches the requested structure exactly. Create unique and diverse scenes while maintaining character consistency and enabling natural character interactions.'
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
      
      if (storyCharacter) {
        parsedScene.character = {
          ...parsedScene.character,
          name: storyCharacter.name,
          image: storyCharacter.image,
          gender: storyCharacter.gender
        };
      }
    } catch (e) {
      console.error('Failed to parse scene content as JSON:', e);
      throw new Error('Generated content is not valid JSON');
    }

    if (!parsedScene.background || !parsedScene.character || !parsedScene.choices) {
      throw new Error('Generated scene is missing required fields');
    }

    // Detect if location has changed
    const locationChanged = currentScene ? 
      await detectLocationChange(currentScene, sceneContent) : 
      true;

    // Only generate new background image if location has changed
    if (locationChanged) {
      console.log('Location changed, generating new background image for:', parsedScene.background);
      const backgroundImageUrl = await generateImageFromPrompt(parsedScene.background);
      parsedScene.background = backgroundImageUrl;
    }

    // Only generate new character image if there's no existing character
    if (!storyCharacter) {
      console.log('Generating main character image for:', parsedScene.character.name);
      const characterDescription = `${parsedScene.character.name} - A ${genre} character with distinct features and expressions`;
      parsedScene.character.image = await generateImageFromPrompt(characterDescription, true);
    }

    // Generate images for new characters
    const newCharacters = [];
    if (parsedScene.otherCharacters?.length > 0) {
      for (const char of parsedScene.otherCharacters) {
        const existingChar = storyCharacters?.find(c => c.name === char.name);
        if (!existingChar) {
          console.log('Generating new character image for:', char.name);
          const characterDescription = `${char.name} - A ${genre} character with distinct features and expressions`;
          char.image = await generateImageFromPrompt(characterDescription, true);
          newCharacters.push({
            name: char.name,
            image: char.image,
            gender: char.gender
          });
        } else {
          char.image = existingChar.image;
        }
      }
    }

    console.log('Successfully generated and validated scene with images');
    return new Response(
      JSON.stringify({ 
        scene: JSON.stringify(parsedScene),
        locationChanged,
        newCharacters: newCharacters.length > 0 ? newCharacters : undefined
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

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
