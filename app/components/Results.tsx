import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { CheckCircle2, XCircle } from 'lucide-react';

const Results: React.FC = () => {
  const { score, totalRounds, phase } = useGame();

  if (phase !== 'feedback') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-yellow/20"
    >
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow">Game Results</h2>
        
        <div className="flex items-center gap-2 text-yellow">
          <span className="text-4xl md:text-5xl font-bold">{score}</span>
          <span className="text-lg md:text-xl">/ {totalRounds}</span>
        </div>

        <div className="w-full max-w-xs">
          <div className="h-2 bg-yellow/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score / totalRounds) * 100}%` }}
              className="h-full bg-yellow"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-yellow/80">
          {score === totalRounds ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm md:text-base">
            {score === totalRounds
              ? 'Perfect score!'
              : `${totalRounds - score} incorrect guesses`}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Results; 