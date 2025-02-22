import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff } from 'lucide-react';

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
    setStoryBackground,
    storyCharacter,
    setStoryCharacter
  } = useMovieStore();
  const [isListening, setIsListening] = useState(false);
  const [customChoice, setCustomChoice] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const generateScene = async (choice?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene', {
        body: { 
          genre,
          currentScene,
          lastChoice: choice,
          storyCharacter
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

      if (!storyCharacter) {
        const character = {
          name: newScene.mainCharacter.name,
          image: newScene.mainCharacter.image,
          gender: newScene.mainCharacter.gender
        };
        console.log('Setting initial character:', character);
        setStoryCharacter(character);
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

  const speakDialogue = async (character: any, index: number) => {
    if (!character?.dialogue) return;
    setIsListening(true);
    setActiveCharacterIndex(index);
    
    try {
      const voiceId = character.gender === 'female' ? 'EXAVITQu4vr4xnSDxMaL' : '21m00Tcm4TlvDq8ikWAM';
      
      console.log('Speaking dialogue with:', {
        gender: character.gender,
        voiceId: voiceId,
        text: character.dialogue
      });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: character.dialogue,
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
        await audioRef.current.play();
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
      setActiveCharacterIndex(-1);
    }
  };

  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;

            if (data.text) {
              console.log('Voice input converted to text:', data.text);
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
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your choice now",
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

  const stopVoiceInput = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (currentScene && !isGenerating) {
      const playNextCharacter = async (index = 0) => {
        const characters = [currentScene.mainCharacter, ...currentScene.supportingCharacters];
        if (index < characters.length) {
          await speakDialogue(characters[index], index);
          setTimeout(() => playNextCharacter(index + 1), 1000);
        }
      };
      playNextCharacter();
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

  const handleCustomChoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChoice.trim()) {
      generateScene(customChoice.trim());
      setCustomChoice("");
    }
  };

  if (!currentScene) return null;

  const allCharacters = [currentScene.mainCharacter, ...currentScene.supportingCharacters];

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
            className="cinema-card max-w-4xl mx-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-wrap gap-6 mb-6">
              {allCharacters.map((character, index) => (
                <motion.div 
                  key={index}
                  className={`relative ${activeCharacterIndex === index ? 'scale-105' : ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 * index }}
                >
                  <div className="w-24 h-24 relative">
                    <img 
                      src={character.image} 
                      alt={character.name}
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                    {activeCharacterIndex === index && (
                      <motion.div 
                        className="absolute inset-0 border-2 border-cinema-accent rounded-lg"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2 text-center">{character.name}</p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-6">
              {allCharacters.map((character, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className={`p-4 rounded-lg ${
                    activeCharacterIndex === index ? 'bg-cinema-accent/20' : 'bg-black/40'
                  }`}
                >
                  <p className="text-lg">{character.dialogue}</p>
                </motion.div>
              ))}
            </div>
              
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex gap-4 justify-end items-center">
                {currentScene.choices.map((choice, index) => (
                  <button
                    key={index}
                    className="cinema-button"
                    onClick={() => generateScene(choice)}
                    disabled={isGenerating || isListening}
                  >
                    {choice}
                  </button>
                ))}
                <button
                  className={`cinema-button p-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  onClick={isRecording ? stopVoiceInput : startVoiceInput}
                  disabled={isGenerating || isListening}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              
              <form onSubmit={handleCustomChoice} className="flex gap-4 justify-end">
                <input
                  type="text"
                  value={customChoice}
                  onChange={(e) => setCustomChoice(e.target.value)}
                  placeholder="Write your own choice..."
                  className="bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 w-64"
                  disabled={isGenerating || isListening}
                />
                <button
                  type="submit"
                  className="cinema-button"
                  disabled={isGenerating || isListening || !customChoice.trim()}
                >
                  Make Choice
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMovie;
