
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversation } from '@11labs/react';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface SceneData {
  id: number;
  background: string;
  character: {
    name: string;
    voiceId: string;
    dialogue: string;
    image: string;
  };
  choices: string[];
}

const InteractiveMovie = () => {
  const { toast } = useToast();
  const { 
    genre, 
    currentScene, 
    setCurrentScene, 
    addToHistory, 
    isGenerating, 
    setIsGenerating,
    storyBackground,
    setStoryBackground 
  } = useMovieStore();
  const [isListening, setIsListening] = useState(false);
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
        voiceId: currentScene?.character?.voiceId || "21m00Tcm4TlvDq8ikWAM", // Use character's voice ID or fallback to Rachel
      },
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      toast({
        title: "Error",
        description: "There was an error with the voice interaction",
        variant: "destructive",
      });
    },
  });

  const speakDialogue = async () => {
    if (!currentScene?.character?.dialogue) return;
    
    try {
      const session = await conversation.startSession({
        agentId: "default",
      });
      console.log("Started session:", session);
      
      // Send the dialogue directly to be spoken
      await conversation.send({
        text: currentScene.character.dialogue,
      });
    } catch (error) {
      console.error("Error speaking dialogue:", error);
      toast({
        title: "Error",
        description: "Failed to speak dialogue",
        variant: "destructive",
      });
    }
  };

  const generateScene = async (choice?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene', {
        body: { 
          genre,
          currentScene,
          lastChoice: choice,
          storyBackground
        }
      });

      if (error) throw error;
      
      const newScene = {
        id: currentScene ? currentScene.id + 1 : 1,
        ...JSON.parse(data.scene)
      };

      if (!currentScene && !storyBackground) {
        setStoryBackground(newScene.background);
      }

      if (currentScene) {
        addToHistory(currentScene);
      }
      
      if (storyBackground) {
        newScene.background = storyBackground;
      }
      
      setCurrentScene(newScene);
      
      // Speak the dialogue after setting the new scene
      setTimeout(() => {
        speakDialogue();
      }, 1000); // Small delay to ensure the scene is properly set

    } catch (error) {
      console.error('Error generating scene:', error);
      toast({
        title: "Error",
        description: "Failed to generate the next scene",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (genre && elevenlabsApiKey && !currentScene && !isGenerating) {
      generateScene();
    }
  }, [genre, elevenlabsApiKey]);

  const handleVoiceInteraction = async () => {
    setIsListening(true);
    await speakDialogue();
    setIsListening(false);
  };

  const handleChoice = async (choice: string) => {
    generateScene(choice);
  };

  if (!currentScene) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div 
        className="relative h-full"
        style={{
          backgroundImage: `url(${currentScene.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <motion.div 
            className="cinema-card max-w-4xl mx-auto flex items-end gap-8"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="relative w-48 h-48"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <img 
                src={currentScene.character.image} 
                alt={currentScene.character.name}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </motion.div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4">{currentScene.character.name}</h3>
              <p className="text-lg mb-6">{currentScene.character.dialogue}</p>
              
              <div className="flex items-center justify-between">
                <button
                  className={`cinema-button ${isListening ? 'bg-red-500' : ''}`}
                  onClick={handleVoiceInteraction}
                  disabled={isGenerating}
                >
                  {isListening ? 'Listening...' : 'Speak'}
                </button>
                
                <div className="flex gap-4">
                  {currentScene.choices.map((choice, index) => (
                    <button
                      key={index}
                      className="cinema-button"
                      onClick={() => handleChoice(choice)}
                      disabled={isGenerating}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMovie;
