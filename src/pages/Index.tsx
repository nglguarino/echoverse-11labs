
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GenreSelection from '@/components/GenreSelection';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const { setGenre, genre } = useMovieStore();
  const [isStarting, setIsStarting] = useState(false);

  const handleGenreSelect = (selectedGenre: string) => {
    setGenre(selectedGenre);
    setIsStarting(true);
    toast({
      title: 'Genre Selected',
      description: `Preparing your ${selectedGenre} adventure...`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key="genre-selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <GenreSelection onSelect={handleGenreSelect} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
