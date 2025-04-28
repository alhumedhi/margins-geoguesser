import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HomePageProps {
  onStartGame: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartGame }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter italic text-yellow mb-6">
          margin&apos;s fashion history geoguesser
        </h1>
        
        <p className="minimal-text text-yellow max-w-xl mx-auto mb-12">
          you can&apos;t call yourself into archival fashion if it only starts and ends in the 90s. 
          test your geographic knowledge of fashion history with a margin&apos;s version of geoguesser
        </p>
        
        <motion.button
          onClick={onStartGame}
          className="bg-yellow text-black py-4 px-10 rounded-lg text-xl tracking-tight hover:opacity-90 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          play
        </motion.button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-6 text-yellow/50 minimal-text text-sm"
      >
        <p>Images from The Metropolitan Museum of Art Collection</p>
      </motion.div>
    </div>
  );
};

export default HomePage;
