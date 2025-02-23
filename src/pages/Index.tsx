
import { motion, AnimatePresence } from 'framer-motion';
import GenreSelection from '@/components/GenreSelection';
import InteractiveMovie from '@/components/InteractiveMovie';
import { useMovieStore } from '@/stores/movieStore';

const Index = () => {
  const { genre, currentScene, isGenerating, setGenre } = useMovieStore();

  const handleGenreSelect = async (selectedGenre: string) => {
    setGenre(selectedGenre);
  };

  const showGenreSelection = !genre;
  const showMovie = genre;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatePresence mode="wait">
        {showGenreSelection ? (
          <motion.div
            key="genre-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <GenreSelection onSelect={handleGenreSelect} isStarting={false} />
          </motion.div>
        ) : showMovie && (
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
