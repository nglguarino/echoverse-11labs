
import { useMovieStore, StoryEnding as StoryEndingType } from '@/stores/movieStore';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Trophy, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StoryEnding = () => {
  const { storyEnding, sceneHistory, resetStoryEnding } = useMovieStore();

  const handleViewTranscript = () => {
    const transcript = sceneHistory.map((scene, index) => `
Scene ${index + 1}:
${scene.character.name}: ${scene.character.dialogue}
`).join('\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinue = () => {
    resetStoryEnding();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center"
    >
      <div className="max-w-2xl w-full mx-4 p-8 rounded-lg bg-black/80 border border-white/20">
        <div className="flex items-center justify-center mb-6">
          {storyEnding?.type === 'success' ? (
            <Trophy className="w-16 h-16 text-yellow-500" />
          ) : (
            <Skull className="w-16 h-16 text-red-500" />
          )}
        </div>
        
        <h2 className={`text-3xl font-bold text-center mb-4 ${
          storyEnding?.type === 'success' ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {storyEnding?.type === 'success' ? 'Quest Completed!' : 'Game Over'}
        </h2>
        
        <p className="text-white text-lg text-center mb-8">
          {storyEnding?.message}
        </p>
        
        {storyEnding?.achievement && (
          <p className="text-yellow-500 text-center mb-8 text-lg">
            Achievement: {storyEnding.achievement}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleViewTranscript}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Transcript
          </Button>
          
          <Button
            onClick={handleContinue}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Continue Interaction
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryEnding;
