
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="fixed inset-0 flex items-center justify-center bg-cinema-background">
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
              className="w-16 h-16 border-4 border-t-[#1EAEDB] border-r-[#9b87f5] border-b-[#1EAEDB] border-l-[#9b87f5] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p 
              className="text-lg text-cinema-text font-medium"
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
            className="text-center max-w-lg mx-auto p-6"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 text-center bg-clip-text text-transparent 
                         bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-[#1EAEDB] animate-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              DreamVerse
            </motion.h1>
            
            <motion.p 
              className="text-cinema-text/80 text-lg md:text-xl text-center mb-16
                         font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Your story awaits in the darkness...
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-[#1EAEDB] 
                           rounded-lg blur-md opacity-75"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.button
                className="relative bg-cinema-background px-8 py-4 text-lg rounded-lg
                           text-white font-medium tracking-wide
                           transition-all duration-300 transform
                           hover:scale-105 active:scale-95"
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

      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle,rgba(30,174,219,0.1)_1px,transparent_1px)] 
                     [background-size:32px_32px]"
          animate={{
            backgroundPosition: ["0px 0px", "32px 32px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  );
};

export default GenreSelection;
