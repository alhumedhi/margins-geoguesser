import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { formatScore, formatDistance, getScoreColor } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

const FeedbackPanel: React.FC = () => {
  const { 
    phase, 
    nextRound, 
    roundHistory, 
    currentRound, 
    totalRounds 
  } = useGame();
  
  // Only show if we're in feedback phase
  if (phase !== 'feedback' || roundHistory.length === 0) {
    return null;
  }
  
  // Get the latest round result
  const result = roundHistory[roundHistory.length - 1];
  
  // Calculate accuracy percentage
  const accuracy = Math.min(100, Math.round((result.score / 1000) * 100));
  
  return (
    <motion.div
      className="w-full mt-8 border border-yellow rounded-lg bg-black/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-4 text-yellow">Round Results</h3>
        
        <div className="mb-4">
          <div className="text-lg mb-1">Item Origin:</div>
          <div className="text-2xl font-bold text-white">{result.item.country}</div>
          {result.item.city && (
            <div className="text-md text-yellow">
              {result.item.city}, {result.item.state || result.item.region || ''}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="text-lg mb-1">Your Guess:</div>
          <div className="text-xl">
            {typeof result.guess === 'string' 
              ? result.guess 
              : `Latitude: ${result.guess.lat.toFixed(2)}, Longitude: ${result.guess.lng.toFixed(2)}`}
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded-md">
            <div className="text-sm text-yellow">Score</div>
            <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
              {formatScore(result.score)}
            </div>
          </div>
          
          {result.distance !== undefined && (
            <div className="bg-black/30 p-3 rounded-md">
              <div className="text-sm text-yellow">Distance</div>
              <div className="text-2xl font-bold">
                {formatDistance(result.distance)}
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-5">
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${accuracy}%`,
                backgroundColor: getScoreColor(result.score).replace('text-', 'bg-')
              }}
            ></div>
          </div>
          <div className="text-sm mt-1 text-right">
            Accuracy: {accuracy}%
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-lg mb-2">Item Information:</div>
          <div className="bg-black/20 p-3 rounded-md text-sm">
            <div><strong>Title:</strong> {result.item.title}</div>
            {result.item.culture && <div><strong>Culture:</strong> {result.item.culture}</div>}
            {result.item.objectDate && <div><strong>Date:</strong> {result.item.objectDate}</div>}
            {result.item.medium && <div><strong>Medium:</strong> {result.item.medium}</div>}
          </div>
        </div>
      </div>
      
      <button
        onClick={nextRound}
        className="w-full bg-yellow hover:bg-yellow text-black font-semibold py-3 flex items-center justify-center gap-2"
      >
        {currentRound < totalRounds ? (
          <>Next Round <ArrowRight className="w-4 h-4" /></>
        ) : (
          <>See Final Results <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </motion.div>
  );
};

export default FeedbackPanel; 