import React from 'react';
import { motion } from 'framer-motion';
import { MetObject } from './types/met';

interface GuessResultPopupProps {
  item: MetObject;
  score: number;
  roundsLeft: number;
  onContinue: () => void;
}

const GuessResultPopup: React.FC<GuessResultPopupProps> = ({ 
  item, 
  score, 
  roundsLeft,
  onContinue 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onContinue}></div>
      
      <div className="relative bg-black border border-neon-yellow/30 rounded-lg p-8 max-w-md w-full">
        <h2 className="title-font text-neon-yellow text-3xl italic mb-6 tracking-tighter text-center">
          The Correct Location is
        </h2>
        
        <h3 className="title-font text-neon-yellow text-4xl italic mb-8 text-center">
          {item.country || 'Unknown'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center">
            <p className="body-font text-neon-yellow/60 mb-1">Total Points</p>
            <p className="title-font text-neon-yellow text-3xl">{score}</p>
          </div>
          
          <div className="text-center">
            <p className="body-font text-neon-yellow/60 mb-1">Rounds Left</p>
            <p className="title-font text-neon-yellow text-3xl">{roundsLeft}</p>
          </div>
        </div>
        
        <motion.button
          onClick={onContinue}
          className="w-full bg-neon-yellow text-black title-font py-3 rounded tracking-tight"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {roundsLeft > 0 ? 'CONTINUE' : 'SEE FINAL RESULTS'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default GuessResultPopup;
