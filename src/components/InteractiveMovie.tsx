import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import StoryEnding from '@/components/StoryEnding';
import { useNavigate } from 'react-router-dom';

const VOICE_IDS = {
  MALE: 'CwhRBWXzGAHq8TQ4Fs17',   // Roger - clear male voice
  FEMALE: 'EXAVITQu4vr4xnSDxMaL'  // Sarah - clear female voice
} as const;

const InteractiveMovie = () => {
  const navigate = useNavigate();
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
    setStoryCharacter,
    storyEnding,
    setStoryEnding,
    hasShownEnding,
    setGenre,
  } = useMovieStore();
  const [isListening, setIsListening] = useState(false);
  const [customChoice, setCustomChoice] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const generateScene = async (choice?: string) => {
    if (isGenerating) return;
    
    console.log('Generating scene with:', { genre, currentScene, choice });
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene', {
        body: { 
          genre,
          currentScene,
          lastChoice: choice,
          storyCharacter,
          currentBackground: storyBackground,
          ignoreEnding: hasShownEnding, // Only ignore endings if we've already shown one
          sceneCount: currentScene?.id || 0 // Send the current scene count to help with pacing
        }
      });

      if (error) throw error;
      
      console.log('Scene generation response:', data);

      // Check for ending if we haven't shown one yet
      if (data.ending && !hasShownEnding) {
        console.log('Ending received:', data.ending);
        if (currentScene) {
          addToHistory(currentScene); // Add the last scene to history before showing ending
        }
        setStoryEnding(data.ending);
        return;
      }
      
      const newScene = {
        id: currentScene ? currentScene.id + 1 : 1,
        ...JSON.parse(data.scene)
      };

      if (!currentScene && !storyBackground) {
        console.log('Setting initial background for first scene');
        setStoryBackground(newScene.background);
      } else if (data.locationChanged) {
        console.log('Location change agreed upon, updating background to:', newScene.background);
        setStoryBackground(newScene.background);
      } else {
        console.log('No explicit location change, keeping current background:', storyBackground);
        newScene.background = storyBackground || newScene.background;
      }

      if (!storyCharacter) {
        const character = {
          name: newScene.character.name,
          image: newScene.character.image,
          gender: newScene.character.gender
        };
        console.log('Setting initial character:', character);
        setStoryCharacter(character);
      }

      const gender = storyCharacter?.gender || newScene.character.gender;
      console.log('Character gender for voice selection:', gender);
      
      newScene.character.voiceId = gender === 'female' ? VOICE_IDS.FEMALE : VOICE_IDS.MALE;
      console.log('Voice ID set to:', newScene.character.voiceId, 'for gender:', gender);

      if (currentScene) {
        addToHistory(currentScene);
      }
      
      setCurrentScene(newScene);
      console.log('New scene set:', newScene);
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

  const speakDialogue = async () => {
    if (!currentScene?.character?.dialogue) return;
    setIsListening(true);
    
    try {
      const gender = currentScene.character.gender;
      const voiceId = gender === 'female' ? VOICE_IDS.FEMALE : VOICE_IDS.MALE;
      
      console.log('Speaking dialogue with:', {
        gender: gender,
        voiceId: voiceId,
        text: currentScene.character.dialogue
      });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: currentScene.character.dialogue,
          voiceId: voiceId
        }
      });

      if (error) {
        console.error('Supabase Edge Function error:', error);
        throw error;
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

  const handleHomeClick = () => {
    setCurrentScene(null);
    setStoryBackground(null);
    setStoryCharacter(null);
    setStoryEnding(null);
    setGenre(null);
    navigate('/');
  };

  useEffect(() => {
    console.log('InteractiveMovie mount effect:', {
      genre,
      currentScene,
      isGenerating
    });
    
    if (genre && !currentScene && !isGenerating) {
      console.log('Starting initial scene generation');
      generateScene();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (currentScene && !isGenerating) {
      console.log('New scene detected, starting automatic speech...');
      const timer = setTimeout(() => {
        speakDialogue();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentScene, isGenerating]);

  return (
    <AnimatePresence mode="wait">
      {isGenerating && !currentScene ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black flex items-center justify-center"
        >
          <div className="text-white text-2xl">Generating your story...</div>
        </motion.div>
      ) : storyEnding ? (
        <StoryEnding key="ending" />
      ) : currentScene && (
        <motion.div 
          key="scene"
          className="fixed inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleHomeClick}
            className="absolute top-8 left-8 md:left-[10%] lg:left-[15%] z-50 cinema-button aspect-square h-[42px] 
                       inline-flex items-center justify-center bg-black/50 backdrop-blur-sm 
                       hover:bg-black/70 hover:border hover:border-violet-400 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

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
                <div className="flex gap-8">
                  <motion.div 
                    className="w-48 shrink-0"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <img 
                      src={currentScene.character.image} 
                      alt={currentScene.character.name}
                      className="w-48 h-48 object-cover rounded-lg shadow-lg"
                    />
                  </motion.div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-4">{currentScene.character.name}</h3>
                    <div className="space-y-6">
                      <p className="text-lg text-white">{currentScene.character.dialogue}</p>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center">
                          <div className="flex gap-4">
                            {currentScene.choices.map((choice, index) => (
                              <button
                                key={index}
                                className="cinema-button text-white"
                                onClick={() => handleChoice(choice)}
                                disabled={isGenerating || isListening}
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex gap-4">
                            <button
                              className={`cinema-button h-[48px] aspect-square inline-flex items-center justify-center ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                              onClick={isRecording ? stopVoiceInput : startVoiceInput}
                              disabled={isGenerating || isListening}
                            >
                              {isRecording ? 
                                <MicOff className="h-5 w-5 text-white" /> : 
                                <Mic className="h-5 w-5 text-white" />
                              }
                            </button>
                            <button
                              onClick={handleCustomChoice}
                              className="cinema-button whitespace-nowrap text-white"
                              disabled={isGenerating || isListening || !customChoice.trim()}
                            >
                              Make Choice
                            </button>
                            <input
                              type="text"
                              value={customChoice}
                              onChange={(e) => setCustomChoice(e.target.value)}
                              placeholder="Write your own choice..."
                              className="bg-black/50 text-white px-4 py-2 rounded-lg border border-white/20 w-64"
                              disabled={isGenerating || isListening}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveMovie;
