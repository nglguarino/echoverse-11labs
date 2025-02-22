
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const audioRef = useRef<HTMLAudioElement>(null);

  const speakDialogue = async () => {
    if (!currentScene?.character?.dialogue) return;
    setIsListening(true);
    
    try {
      console.log('Starting text-to-speech request with:', {
        text: currentScene.character.dialogue,
        voiceId: currentScene.character.voiceId
      });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: currentScene.character.dialogue,
          voiceId: currentScene.character.voiceId
        }
      });

      if (error) {
        console.error('Supabase Edge Function error:', error);
        throw error;
      }

      if (!data?.data) {
        throw new Error('No audio data received');
      }

      console.log('Creating audio blob...');
      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('Setting up audio playback...');
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onloadedmetadata = () => {
          console.log('Audio metadata loaded:', {
            duration: audioRef.current?.duration,
            readyState: audioRef.current?.readyState
          });
        };
        audioRef.current.onerror = (e) => {
          console.error('Audio element error:', e);
        };
        await audioRef.current.play();
        console.log('Audio playback started');
      }

    } catch (error) {
      console.error("Error speaking dialogue:", error);
      toast({
        title: "Error",
        description: "Failed to speak dialogue",
        variant: "destructive",
      });
    } finally {
      setIsListening(false);
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
    if (currentScene && !isGenerating) {
      console.log('New scene detected, starting automatic speech...');
      const timer = setTimeout(() => {
        speakDialogue();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentScene, isGenerating]);

  useEffect(() => {
    if (genre && !currentScene && !isGenerating) {
      generateScene();
    }
  }, [genre]);

  const handleChoice = (choice: string) => {
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
      <audio ref={audioRef} className="hidden" />
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
              
              <div className="flex justify-end">
                <div className="flex gap-4">
                  {currentScene.choices.map((choice, index) => (
                    <button
                      key={index}
                      className="cinema-button"
                      onClick={() => handleChoice(choice)}
                      disabled={isGenerating || isListening}
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
