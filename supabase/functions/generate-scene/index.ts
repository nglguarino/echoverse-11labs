
// @deno-types="https://raw.githubusercontent.com/denoland/deno/v1.37.2/cli/dts/lib.deno.fetch.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const falKey = Deno.env.get('FAL_KEY');

if (!openAIApiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

if (!falKey) {
  throw new Error('Missing FAL_KEY environment variable');
}

async function generateImageFromPrompt(prompt: string, isCharacter: boolean = false) {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: isCharacter 
          ? `professional portrait photograph of ${prompt}, photorealistic, dramatic lighting, cinema quality`
          : `cinematic scene of ${prompt}, atmospheric and dramatic movie scene, 4k quality`,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;
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
    const { genre, currentScene, lastChoice, storyCharacter } = await req.json();
    console.log('Received request:', { genre, currentScene, lastChoice, storyCharacter });

    // Generate scene content with GPT-4
    const systemPrompt = `You are a creative storyteller crafting an interactive movie experience. Generate engaging scenes with multiple characters and natural dialogue.

Current context:
- Genre: ${genre}
${currentScene ? `- Previous scene: ${JSON.stringify(currentScene)}` : '- This is the start of the story'}
${lastChoice ? `- User's last choice: ${lastChoice}` : ''}
${storyCharacter ? `- Main character: ${JSON.stringify(storyCharacter)}` : ''}

Rules:
1. Create scenes with 2-3 characters total (including the main character)
2. Each character must have meaningful dialogue that moves the story forward
3. Provide 2-3 meaningful choices that impact the story
4. Keep dialogues concise but impactful
5. If there's a main character, maintain their name and gender

Format the response as a valid JSON object with this structure:
{
  "background": "[describe the scene setting]",
  "mainCharacter": {
    "name": "[character name]",
    "dialogue": "[character's lines]",
    "gender": "[male/female]"
  },
  "supportingCharacters": [
    {
      "name": "[character name]",
      "dialogue": "[character's lines]",
      "gender": "[male/female]"
    }
  ],
  "choices": ["[choice 1]", "[choice 2]"]
}`;

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the next scene of the story.' }
        ],
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`OpenAI API error: ${chatResponse.statusText}`);
    }

    const chatData = await chatResponse.json();
    console.log('GPT-4 response:', chatData);

    let sceneContent = JSON.parse(chatData.choices[0].message.content);

    // Generate images for new characters
    if (!storyCharacter || !currentScene) {
      // Generate main character image if it's a new story
      const mainCharacterPrompt = `${sceneContent.mainCharacter.name} - A ${genre} character, ${sceneContent.mainCharacter.gender}`;
      sceneContent.mainCharacter.image = await generateImageFromPrompt(mainCharacterPrompt, true);
    } else {
      // Use existing main character details
      sceneContent.mainCharacter = {
        ...sceneContent.mainCharacter,
        image: storyCharacter.image,
        name: storyCharacter.name,
        gender: storyCharacter.gender,
      };
    }

    // Generate background image if it's a new scene
    if (!currentScene) {
      sceneContent.background = await generateImageFromPrompt(sceneContent.background);
    }

    // Generate supporting character images
    for (let i = 0; i < sceneContent.supportingCharacters.length; i++) {
      const character = sceneContent.supportingCharacters[i];
      const characterPrompt = `${character.name} - A ${genre} character, ${character.gender}`;
      sceneContent.supportingCharacters[i].image = await generateImageFromPrompt(characterPrompt, true);
    }

    console.log('Final scene content:', sceneContent);
    return new Response(
      JSON.stringify({ scene: JSON.stringify(sceneContent) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
