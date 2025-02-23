
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GenreSelection from '@/components/GenreSelection';
import InteractiveMovie from '@/components/InteractiveMovie';
import { useMovieStore } from '@/stores/movieStore';

const Index = () => {
  const { setGenre, genre, currentScene } = useMovieStore();
  const [isStarting, setIsStarting] = useState(false);

  const handleGenreSelect = async (selectedGenre: string) => {
    setIsStarting(true);
    setGenre(selectedGenre);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!genre || (genre && !currentScene) ? (
          <motion.div
            key="genre-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <GenreSelection onSelect={handleGenreSelect} isStarting={isStarting} />
          </motion.div>
        ) : (
          <motion.div
            key="interactive-movie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <InteractiveMovie />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
