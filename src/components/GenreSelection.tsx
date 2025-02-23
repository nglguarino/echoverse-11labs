
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDot } from 'lucide-react';

interface GenreSelectionProps {
  onSelect: (genre: string) => void;
  isStarting: boolean;
}

const GenreSelection = ({ onSelect, isStarting }: GenreSelectionProps) => {
  const handleStart = () => {
    const genres = ['action', 'thriller', 'romance'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    onSelect(randomGenre);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cinema-background overflow-hidden">
      <AnimatePresence mode="wait">
        {isStarting ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              className="w-20 h-20 border-4 border-t-[#1EAEDB] border-r-[#9b87f5] border-b-[#1EAEDB] border-l-[#9b87f5] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p 
              className="text-xl text-cinema-text font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Preparing your cinematic journey...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-lg mx-auto p-8 relative z-10"
          >
            <motion.div 
              className="mb-8 relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: {
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  },
                  scale: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
              >
                <CircleDot className="w-16 h-16 mx-auto text-[#1EAEDB]" />
              </motion.div>
              <CircleDot className="w-16 h-16 mx-auto text-[#9b87f5] opacity-50" />
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-7xl font-bold mb-8 text-center bg-clip-text text-transparent 
                         bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-[#1EAEDB] animate-text
                         tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              DreamVerse
            </motion.h1>
            
            <motion.p 
              className="text-cinema-text/80 text-xl md:text-2xl text-center mb-16
                         font-medium tracking-wide leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Step into a world where stories come alive and imagination knows no bounds...
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative inline-block"
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
              <motion.button
                className="relative px-10 py-5 text-xl rounded-lg text-white font-medium tracking-wide
                           transition-all duration-300 transform hover:scale-105"
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Begin Your Journey
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced background elements */}
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

export default GenreSelection;
