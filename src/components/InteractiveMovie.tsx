
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversation } from '@11labs/react';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';

const InteractiveMovie = () => {
  const { toast } = useToast();
  const { genre, getCurrentScene, setCurrentSceneId } = useMovieStore();
  const [isListening, setIsListening] = useState(false);
  const currentScene = getCurrentScene();

  const conversation = useConversation({
    overrides: {
      tts: {
        voiceId: currentScene?.character.voiceId,
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
    if (currentScene) {
      startConversation();
      // Send message to speak the character's dialogue
      conversation.speak(currentScene.character.dialogue);
    }
  }, [currentScene?.id]);

  const startConversation = async () => {
    try {
      await conversation.startSession({
        agentId: "default", // Replace with your actual agent ID once you have it
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleChoice = async (nextSceneId: number) => {
    setCurrentSceneId(nextSceneId);
  };

  const handleVoiceInteraction = async () => {
    setIsListening(true);
    try {
      conversation.startRecording();
      // Voice input handling will be managed through onMessage callback
    } catch (error) {
      console.error("Error with voice interaction:", error);
      toast({
        title: "Error",
        description: "There was an error with the voice interaction",
        variant: "destructive",
      });
    }
    setIsListening(false);
  };

  if (!currentScene) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentScene.id}
          className="relative h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundImage: `url(${currentScene.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <motion.div 
              className="cinema-card max-w-3xl mx-auto"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-4">{currentScene.character.name}</h3>
              <p className="text-lg mb-6">{currentScene.character.dialogue}</p>
              
              <div className="flex items-center justify-between">
                <button
                  className={`cinema-button ${isListening ? 'bg-red-500' : ''}`}
                  onClick={handleVoiceInteraction}
                >
                  {isListening ? 'Listening...' : 'Speak'}
                </button>
                
                <div className="flex gap-4">
                  {currentScene.choices.map((choice, index) => (
                    <button
                      key={index}
                      className="cinema-button"
                      onClick={() => handleChoice(choice.nextSceneId)}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default InteractiveMovie;
