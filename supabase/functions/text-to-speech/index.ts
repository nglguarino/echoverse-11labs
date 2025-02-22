
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Processing request for voice:', voiceId, 'with text:', text)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') || '',
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('ElevenLabs API error:', error)
      throw new Error(error.detail?.message || 'Failed to generate speech')
    }

    // Get the audio data as an ArrayBuffer
    const audioBuffer = await response.arrayBuffer()
    
    // Convert ArrayBuffer to Base64 using a more reliable method
    const uint8Array = new Uint8Array(audioBuffer)
    const chunks = []
    for (let i = 0; i < uint8Array.length; i += 512) {
      chunks.push(String.fromCharCode.apply(null, uint8Array.subarray(i, i + 512)))
    }
    const base64String = btoa(chunks.join(''))

    console.log('Successfully generated audio, sending response')

    return new Response(
      JSON.stringify({ data: base64String }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
