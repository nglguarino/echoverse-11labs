
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, RefreshCcw } from 'lucide-react';
import { usePlotStore, type Scene, type Character } from '@/stores/plotStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export const PlotSupervisor = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentScene,
    sceneHistory,
    transcript,
    isGenerating,
    isGameOver,
    genre,
    setGenre,
    setCurrentScene,
    addToHistory,
    addToTranscript,
    setIsGenerating,
    setGameOver
  } = usePlotStore();

  const generateScene = async (userInput?: string) => {
    if (!genre) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene', {
        body: {
          genre,
          currentScene,
          userInput,
          transcript: transcript.slice(-5) // Send last 5 transcript entries for context
        }
      });

      if (error) throw error;

      const newScene: Scene = JSON.parse(data.scene);
      
      if (currentScene) {
        addToHistory(currentScene);
      }
      
      setCurrentScene(newScene);
      
      if (newScene.isGameOver) {
        setGameOver(true);
      }

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

  const handleVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;
            if (data.text) {
              addToTranscript(`You: ${data.text}`);
              generateScene(data.text);
            }
          } catch (error) {
            console.error('Error processing voice input:', error);
            toast({
              title: "Error",
              description: "Failed to process voice input",
              variant: "destructive",
            });
          }
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
      
      toast({
        title: "Recording",
        description: "Listening for 5 seconds...",
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const startNewStory = () => {
    setGameOver(false);
    setCurrentScene(null);
    generateScene();
  };

  useEffect(() => {
    if (genre && !currentScene && !isGenerating) {
      generateScene();
    }
  }, [genre]);

  if (!genre) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/90">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-8">Choose Your Story</h1>
          <div className="flex gap-4">
            {['noir', 'fantasy', 'sci-fi'].map((g) => (
              <Button
                key={g}
                onClick={() => setGenre(g)}
                className="text-lg px-8 py-6"
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <AnimatePresence mode="wait">
        {isGameOver ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="max-w-2xl w-full space-y-8 text-center">
              <h2 className="text-4xl font-bold mb-8">Game Over</h2>
              <ScrollArea className="h-[400px] w-full bg-black/50 rounded-lg p-4">
                {transcript.map((text, i) => (
                  <p key={i} className="mb-2">{text}</p>
                ))}
              </ScrollArea>
              <Button onClick={startNewStory} className="mt-8">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Start New Story
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative"
          >
            {currentScene && (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                  style={{ backgroundImage: `url(${currentScene.background})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex gap-4 mb-6">
                      {currentScene.characters.map((char, i) => (
                        <motion.div
                          key={char.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.2 }}
                          className="relative"
                        >
                          <img
                            src={char.image}
                            alt={char.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                          <p className="text-sm mt-2 text-center font-medium">
                            {char.name}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {currentScene.characters.map((char) => (
                        <div 
                          key={`${char.id}-dialogue`}
                          className="bg-black/50 p-4 rounded-lg"
                        >
                          <p className="text-lg">{char.dialogue[char.dialogue.length - 1]}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        {currentScene.choices.map((choice, i) => (
                          <Button
                            key={i}
                            onClick={() => {
                              addToTranscript(`You chose: ${choice}`);
                              generateScene(choice);
                            }}
                            disabled={isGenerating}
                          >
                            {choice}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleVoiceInput}
                        disabled={isGenerating}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlotSupervisor;
