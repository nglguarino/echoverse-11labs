
import { motion } from 'framer-motion';

interface CharacterDialogProps {
  name: string;
  dialogue: string;
  image: string;
  onVoiceInteraction: () => void;
  isListening: boolean;
  choices: string[];
  onChoice: (choice: string) => void;
  isGenerating: boolean;
}

const CharacterDialog = ({
  name,
  dialogue,
  image,
  onVoiceInteraction,
  isListening,
  choices,
  onChoice,
  isGenerating
}: CharacterDialogProps) => {
  return (
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
          src={image} 
          alt={name}
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </motion.div>

      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-4">{name}</h3>
        <p className="text-lg mb-6">{dialogue}</p>
        
        <div className="flex items-center justify-between">
          <button
            className={`cinema-button ${isListening ? 'bg-red-500' : ''}`}
            onClick={onVoiceInteraction}
            disabled={isGenerating}
          >
            {isListening ? 'Listening...' : 'Speak'}
          </button>
          
          <div className="flex gap-4">
            {choices.map((choice, index) => (
              <button
                key={index}
                className="cinema-button"
                onClick={() => onChoice(choice)}
                disabled={isGenerating}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterDialog;
