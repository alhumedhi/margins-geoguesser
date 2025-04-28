import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const LoadingScreen: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative w-40 h-40 mx-auto mb-8">
          {!imageError ? (
            <Image 
              src="/rotating-earth.gif" 
              alt="Rotating Earth"
              width={160}
              height={160}
              className="rounded-full"
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback if image fails to load
            <div className="w-40 h-40 rounded-full overflow-hidden flex items-center justify-center">
              <div className="globe-animation">
                <div className="globe"></div>
              </div>
            </div>
          )}
        </div>
        
        <h1 className="title-font text-3xl font-bold text-neon-yellow italic tracking-tighter mb-4">
          Fashion History Around the World
        </h1>
        <p className="body-font text-neon-yellow/70 mb-8">Loading costume artifacts from the MET Collection...</p>
        
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-neon-yellow/20 rounded-full mb-1 overflow-hidden">
            <motion.div 
              className="h-full bg-neon-yellow rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-10 text-center text-yellow-400/30 text-sm"
      >
        <p>Images from The Metropolitan Museum of Art Collection</p>
        <p className="mt-1">Test your knowledge of historical fashion origins</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen; 