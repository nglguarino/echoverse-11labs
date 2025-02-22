
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const genres = [
  {
    id: 'action',
    title: 'Action',
    description: 'High-octane adventures with intense sequences',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'
  },
  {
    id: 'thriller',
    title: 'Thriller',
    description: 'Suspenseful stories that keep you on the edge',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b'
  },
  {
    id: 'romance',
    title: 'Romance',
    description: 'Heart-warming tales of love and connection',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901'
  }
];

interface GenreSelectionProps {
  onSelect: (genre: string) => void;
}

const GenreSelection = ({ onSelect }: GenreSelectionProps) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const handleSelect = (genreId: string) => {
    setSelectedGenre(genreId);
    onSelect(genreId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Choose Your Adventure
      </motion.h1>
      <motion.p 
        className="text-cinema-text/60 text-lg md:text-xl text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Select a genre to begin your personalized cinematic journey
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {genres.map((genre, index) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`
              cinema-card cursor-pointer group
              ${selectedGenre === genre.id ? 'border-cinema-accent' : ''}
            `}
            onClick={() => handleSelect(genre.id)}
          >
            <div className="aspect-video rounded-md overflow-hidden mb-4">
              <img 
                src={`${genre.image}?auto=format&fit=crop&w=800&q=80`}
                alt={genre.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-cinema-accent">
              {genre.title}
            </h3>
            <p className="text-cinema-text/60 text-sm">
              {genre.description}
            </p>
            <ArrowRight 
              className={`
                mt-4 w-5 h-5 transition-all duration-300
                ${selectedGenre === genre.id ? 'text-cinema-accent translate-x-2' : 'opacity-0 -translate-x-2'}
              `}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GenreSelection;
