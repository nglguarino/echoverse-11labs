
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface GenreSelectionProps {
  onSelect: (genre: string) => void;
  isStarting: boolean;
}

const GenreSelection = ({ onSelect }: GenreSelectionProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hoverSoundRef = useRef<HTMLAudioElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement>(null);

  const handleStart = () => {
    if (!isMuted && clickSoundRef.current) {
      clickSoundRef.current.play();
    }
    const genres = ['action', 'thriller', 'romance'];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    onSelect(randomGenre);
  };

  const handleHover = () => {
    if (!isMuted && hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0; // Reset sound to start
      hoverSoundRef.current.play();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    // Initialize audio with low volume
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
    if (hoverSoundRef.current) {
      hoverSoundRef.current.volume = 0.15;
    }
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = 0.2;
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cinema-background overflow-hidden font-inter">
      <audio
        ref={audioRef}
        src="/ambient-cinematic.wav"
        loop
        preload="auto"
      />
      <audio
        ref={hoverSoundRef}
        src="/hover-button-287656.mp3"
        preload="auto"
      />
      <audio
        ref={clickSoundRef}
        src="/click-21156.mp3"
        preload="auto"
      />

      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 p-3 rounded-full bg-black/20 backdrop-blur-sm 
                 border border-white/10 hover:bg-black/30 transition-all duration-300
                 text-white/80 hover:text-white z-50"
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
      >
        {isMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      <motion.div
        key="content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-lg mx-auto p-8 relative z-10 -mt-32"
      >
        <motion.h1 
          className="font-cinzel text-6xl md:text-7xl font-bold mb-6 text-center bg-clip-text text-transparent 
                     bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-[#1EAEDB] animate-text
                     tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Echoverse
        </motion.h1>
        
        <motion.p 
          className="text-cinema-text/80 text-xl md:text-2xl text-center mb-32
                     font-medium tracking-wide leading-relaxed"
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
            className="relative px-10 py-5 text-xl rounded-lg text-white font-medium tracking-wide
                       transition-all duration-300 transform hover:scale-105"
            onClick={handleStart}
            onMouseEnter={handleHover}
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
