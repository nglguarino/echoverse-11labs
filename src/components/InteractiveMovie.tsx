
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversation } from '@11labs/react';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';

interface SceneData {
  id: number;
  background: string;
  character: {
    name: string;
    voiceId: string;
    dialogue: string;
  };
  choices: string[];
}

const InteractiveMovie = () => {
  const { toast } = useToast();
  const { genre } = useMovieStore();
  const [currentScene, setCurrentScene] = useState<SceneData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    apiKey: apiKey,
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

  // Example scene for testing
  const demoScene: SceneData = {
    id: 1,
    background: "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
    character: {
      name: "Sarah",
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      dialogue: "Hello there! I need your help. Should we take the path through the forest or head towards the city?",
    },
    choices: ["Forest path", "City route"],
  };

  useEffect(() => {
    if (genre && isKeySet) {
      setCurrentScene(demoScene);
      startConversation();
    }
  }, [genre, isKeySet]);

  const startConversation = async () => {
    try {
      await conversation.startSession({
        agentId: "default", // Replace with your ElevenLabs agent ID
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleVoiceInteraction = async () => {
    setIsListening(true);
    // Voice interaction logic here
    setIsListening(false);
  };

  const handleSubmitApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setIsKeySet(true);
      toast({
        title: "Success",
        description: "ElevenLabs API key has been set",
      });
    }
  };

  if (!isKeySet) {
    return (
      <motion.div 
        className="fixed inset-0 bg-black/90 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <form 
          onSubmit={handleSubmitApiKey}
          className="bg-black/80 p-8 rounded-lg border border-gray-700 w-full max-w-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Enter ElevenLabs API Key</h2>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Enter your API key"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Start Experience
          </button>
        </form>
      </motion.div>
    );
  }

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
                    onClick={() => console.log(`Selected: ${choice}`)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMovie;
