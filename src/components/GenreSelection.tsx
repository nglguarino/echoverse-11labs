import { motion } from 'framer-motion';

interface GenreSelectionProps {
  onSelect: (genre: string) => void;
}

const GenreSelection = ({ onSelect }: GenreSelectionProps) => {
  const handleStart = () => {
    // Randomly select a genre to keep the story generation diverse
    const genres = ['action', 'thriller', 'romance'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    onSelect(randomGenre);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        First Person Flicks
      </motion.h1>
      
      <motion.p 
        className="text-cinema-text/60 text-lg md:text-xl text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Your interactive cinematic journey awaits
      </motion.p>

      <motion.button
        className="cinema-button bg-[#1EAEDB] text-white px-8 py-4 text-lg rounded-lg
                   hover:bg-[#1EAEDB]/90 transition-all duration-300
                   hover:shadow-[0_0_20px_rgba(30,174,219,0.3)]"
        onClick={handleStart}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        Start the Adventure
      </motion.button>
    </div>
  );
};

export default GenreSelection;
