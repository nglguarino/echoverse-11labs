import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMovieStore } from '@/stores/movieStore';
import { useConversation } from '@11labs/react';
import LoadingScreen from './movie/LoadingScreen';
import StoryScene from './movie/StoryScene';
import VoiceHandler from './movie/VoiceHandler';
import SceneGenerator from './movie/SceneGenerator';

const InteractiveMovie = () => {
  const { currentScene, isGenerating } = useMovieStore();
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<ReturnType<typeof useConversation> | null>(null);

  const handleVoiceInteraction = async () => {
    setIsListening(true);
    // Voice interaction logic here
    setIsListening(false);
  };

  const startConversation = async () => {
    if (conversation) {
      try {
        await conversation.startSession({
          agentId: "default",
        });
      } catch (error) {
        console.error("Error starting conversation:", error);
      }
    }
  };

  const handleChoice = (choice: string) => {
    setIsListening(false);
  };

  if (!currentScene && !isGenerating) {
    return <LoadingScreen />;
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <VoiceHandler onConversationReady={setConversation} />
      <SceneGenerator 
        onConversationStart={startConversation}
        choice={undefined}
      />

      {currentScene && (
        <StoryScene
          currentScene={currentScene}
          isListening={isListening}
          isGenerating={isGenerating}
          onVoiceInteraction={handleVoiceInteraction}
          onChoice={handleChoice}
        />
      )}
    </motion.div>
  );
};

export default InteractiveMovie;
