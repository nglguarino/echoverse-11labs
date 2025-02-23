
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const InteractiveMovie = () => {
  const { toast } = useToast();
  const { 
    genre, 
    currentScene, 
    setCurrentScene, 
    addToHistory, 
    isGenerating, 
    setIsGenerating,
    advanceDialogue
  } = useMovieStore();
  const [isListening, setIsListening] = useState(false);
  const [customChoice, setCustomChoice] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const speakDialogue = async () => {
    if (!currentScene?.activeCharacterId) return;
    
    const activeCharacter = currentScene.characters.find(
      char => char.id === currentScene.activeCharacterId
    );
    if (!activeCharacter?.currentDialogue) return;

    setIsListening(true);
    
    try {
      const voiceId = activeCharacter.voiceId || 
        (activeCharacter.gender === 'female' ? 'EXAVITQu4vr4xnSDxMaL' : '21m00Tcm4TlvDq8ikWAM');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: activeCharacter.currentDialogue,
          voiceId: voiceId
        }
      });

      if (error) throw error;

      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          advanceDialogue();
          setIsListening(false);
        };
        await audioRef.current.play();
      }

    } catch (error) {
      console.error("Error speaking dialogue:", error);
      toast({
        title: "Error",
        description: "Failed to speak dialogue",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const handleChoice = (choice: string) => {
    if (!currentScene?.isComplete) return;
    generateScene(choice);
  };

  const handleCustomChoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScene?.isComplete) return;
    if (customChoice.trim()) {
      generateScene(customChoice.trim());
      setCustomChoice("");
    }
  };

  const generateScene = async (choice?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene', {
        body: { 
          genre,
          currentScene,
          lastChoice: choice
        }
      });

      if (error) throw error;
      
      if (!data?.scene) {
        throw new Error('No scene data received from server');
      }

      const parsedScene = JSON.parse(data.scene);
      
      if (!parsedScene?.characters?.length) {
        throw new Error('Invalid scene data: missing characters');
      }

      const newScene = {
        id: currentScene ? currentScene.id + 1 : 1,
        ...parsedScene,
        activeCharacterId: parsedScene.characters[0].id,
        isComplete: false
      };

      if (currentScene) {
        addToHistory(currentScene);
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
    if (currentScene && !isGenerating && currentScene.activeCharacterId) {
      speakDialogue();
    }
  }, [currentScene?.activeCharacterId, isGenerating]);

  useEffect(() => {
    if (genre && !currentScene && !isGenerating) {
      generateScene();
    }
  }, [genre]);

  if (!currentScene) return null;

  return (
    <div 
      className="fixed inset-0 bg-black"
      style={{
        backgroundImage: `url(${currentScene.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <audio ref={audioRef} className="hidden" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      
      {/* Character Status Panel */}
      <div className="absolute top-0 left-0 right-0 bg-black/60 p-4">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          {currentScene.characters.map((char) => (
            <div 
              key={char.id}
              className={`flex items-center gap-2 p-2 rounded ${
                char.id === currentScene.activeCharacterId 
                  ? 'bg-white/20 ring-2 ring-white' 
                  : ''
              }`}
            >
              <img 
                src={char.image} 
                alt={char.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-white">{char.name}</p>
                <Badge variant={char.id === currentScene.activeCharacterId ? "default" : "secondary"}>
                  {char.id === currentScene.activeCharacterId ? "Speaking" : "Waiting"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dialog and Choices */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {currentScene.activeCharacterId && (
              <motion.div
                key={currentScene.activeCharacterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/60 p-6 rounded-lg text-white"
              >
                {currentScene.characters.find(
                  char => char.id === currentScene.activeCharacterId
                )?.currentDialogue}
              </motion.div>
            )}
          </AnimatePresence>

          {currentScene.isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              <div className="flex gap-4 justify-end items-center">
                {currentScene.choices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    disabled={isGenerating || isListening}
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    {choice}
                  </Button>
                ))}
              </div>
              
              <form onSubmit={handleCustomChoice} className="flex gap-4 justify-end">
                <input
                  type="text"
                  value={customChoice}
                  onChange={(e) => setCustomChoice(e.target.value)}
                  placeholder="Write your own choice..."
                  className="bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 w-64"
                  disabled={isGenerating || isListening || !currentScene.isComplete}
                />
                <Button
                  type="submit"
                  disabled={isGenerating || isListening || !customChoice.trim() || !currentScene.isComplete}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  Make Choice
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMovie;
