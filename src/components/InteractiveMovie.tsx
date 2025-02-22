
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMovieStore } from '@/stores/movieStore';
import { useConversation } from '@11labs/react';
import CharacterDialog from './movie/CharacterDialog';
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
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin" />
          <div>Creating your story...</div>
        </motion.div>
      </div>
    );
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
            <CharacterDialog
              name={currentScene.character.name}
              dialogue={currentScene.character.dialogue}
              image={currentScene.character.image}
              onVoiceInteraction={handleVoiceInteraction}
              isListening={isListening}
              choices={currentScene.choices}
              onChoice={handleChoice}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InteractiveMovie;
