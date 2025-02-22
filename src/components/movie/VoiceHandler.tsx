
import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface VoiceHandlerProps {
  onConversationReady: (conversation: ReturnType<typeof useConversation>) => void;
}

const VoiceHandler = ({ onConversationReady }: VoiceHandlerProps) => {
  const { toast } = useToast();
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState<string>('');

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'ELEVEN_LABS_API_KEY' }
        });
        
        if (error) throw error;
        if (!data) throw new Error('No data received from the server');
        
        setElevenlabsApiKey(data.ELEVEN_LABS_API_KEY);
      } catch (error) {
        console.error('Error fetching API key:', error);
        toast({
          title: "Error",
          description: "Could not fetch API key",
          variant: "destructive",
        });
      }
    };

    fetchApiKey();
  }, [toast]);

  const conversation = useConversation({
    apiKey: elevenlabsApiKey,
    overrides: {
      tts: {
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
      },
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error with the voice interaction",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (elevenlabsApiKey) {
      onConversationReady(conversation);
    }
  }, [elevenlabsApiKey, conversation, onConversationReady]);

  return null;
};

export default VoiceHandler;
