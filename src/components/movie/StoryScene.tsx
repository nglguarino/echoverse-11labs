
import { Scene } from '@/stores/movieStore';
import CharacterDialog from './CharacterDialog';

interface StorySceneProps {
  currentScene: Scene;
  isListening: boolean;
  isGenerating: boolean;
  onVoiceInteraction: () => void;
  onChoice: (choice: string) => void;
}

const StoryScene = ({ 
  currentScene, 
  isListening, 
  isGenerating, 
  onVoiceInteraction, 
  onChoice 
}: StorySceneProps) => {
  return (
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
          onVoiceInteraction={onVoiceInteraction}
          isListening={isListening}
          choices={currentScene.choices}
          onChoice={onChoice}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default StoryScene;
