
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
You: ${scene.choices ? `Chose to "${scene.choices[0]}"` : ""}
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

  const formatEndingMessage = (message: string): string => {
    if (!message) return "";
    
    // If message already starts with "Your", return as is
    if (message.trim().toLowerCase().startsWith("your")) {
      return message;
    }
    
    const cleanMessage = message
      // Replace possessive forms first (e.g., "Evelyn's loud screams" -> "Your loud screams")
      .replace(/^([A-Za-z]+)'s/, "Your")
      // Replace character name at start of sentence with "Your" if followed by a noun
      .replace(/^[A-Z][a-z]+\s+(decision|choice|actions?|attempt|response)/, "Your $1")
      // If not a possession/noun case, replace with "You"
      .replace(/^[A-Z][a-z]+\s/, "You ")
      // Replace pronouns and fix verb agreement
      .replace(/\b(?:his|her|their)\b/gi, "your")
      .replace(/\b(?:has|have)\b/gi, "have")
      .replace(/\b(?:was|were)\b/gi, "were")
      .trim();

    return cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cinema-background overflow-hidden font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="max-w-2xl w-full mx-4 relative z-10"
      >
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex items-center justify-center">
            {storyEnding?.type === 'success' ? (
              <Trophy className="w-20 h-20 text-[#1EAEDB]" />
            ) : (
              <Skull className="w-20 h-20 text-[#1EAEDB]" />
            )}
          </div>
          
          <h2 className="font-cinzel text-5xl md:text-6xl font-bold bg-clip-text text-transparent 
                         bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-[#1EAEDB] animate-text">
            {storyEnding?.type === 'success' ? 'Quest Completed!' : 'Game Over'}
          </h2>
          
          <p className="text-cinema-text/80 text-xl md:text-2xl font-medium tracking-wide leading-relaxed">
            {storyEnding ? formatEndingMessage(storyEnding.message) : ''}
          </p>
          
          {storyEnding?.achievement && (
            <p className="text-[#1EAEDB] text-lg md:text-xl font-medium">
              Achievement: {storyEnding.achievement}
            </p>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-[#1EAEDB] 
                           rounded-lg blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <Button
                variant="outline"
                onClick={handleViewTranscript}
                className="relative px-6 py-3 text-lg rounded-lg text-white border-white/20 
                          backdrop-blur-sm bg-black/30 hover:bg-black/40 transition-all duration-300
                          flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Transcript
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-[#1EAEDB] 
                           rounded-lg blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <Button
                onClick={handleContinue}
                className="relative px-6 py-3 text-lg rounded-lg text-white border-white/20 
                          backdrop-blur-sm bg-black/30 hover:bg-black/40 transition-all duration-300
                          flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Continue Journey
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle,rgba(30,174,219,0.03)_1px,transparent_1px)] 
                     [background-size:24px_24px]"
          animate={{
            backgroundPosition: ["0px 0px", "24px 24px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cinema-background via-transparent to-cinema-background opacity-90" />
      </div>
    </div>
  );
};

export default StoryEnding;
