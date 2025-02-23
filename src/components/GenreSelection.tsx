
import { motion, AnimatePresence } from 'framer-motion';

interface GenreSelectionProps {
  onSelect: (genre: string) => void;
  isStarting: boolean;
}

const GenreSelection = ({ onSelect }: GenreSelectionProps) => {
  const handleStart = () => {
    const genres = ['action', 'thriller', 'romance'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    onSelect(randomGenre);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cinema-background overflow-hidden font-inter">
      <motion.div
        key="content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center w-full max-w-lg mx-auto p-4 sm:p-8 relative z-10 -mt-16 sm:-mt-32"
      >
        <motion.h1 
          className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 text-center 
                     bg-clip-text text-transparent bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] 
                     to-[#1EAEDB] animate-text tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Echoverse
        </motion.h1>
        
        <motion.p 
          className="text-cinema-text/80 text-lg sm:text-xl md:text-2xl text-center mb-16 sm:mb-32
                     font-medium tracking-wide leading-relaxed px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Let your imagination drive the story.
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
            className="relative px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl rounded-lg text-white 
                       font-medium tracking-wide transition-all duration-300 transform hover:scale-105"
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Begin Your Journey
          </motion.button>
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

export default GenreSelection;
