
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white text-xl flex flex-col items-center gap-4"
      >
        <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin" />
        <div>Creating your story...</div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
