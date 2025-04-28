import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { formatScore, getScoreColor } from '../lib/utils';
import { RefreshCw, Award, MapPin } from 'lucide-react';
import { RoundResult } from '../context/GameContext';

const GameOverPanel: React.FC = () => {
  const { phase, restartGame, roundHistory, totalScore, totalRounds } = useGame();
  
  if (phase !== 'gameOver') {
    return null;
  }
  
  // Calculate average score
  const averageScore = Math.round(totalScore / totalRounds);
  
  // Get rank based on average score
  const getRank = (avg: number) => {
    if (avg >= 900) return { title: 'Fashion Historian', description: 'Unbelievable knowledge of global fashion history!' };
    if (avg >= 800) return { title: 'Costume Expert', description: 'Your knowledge of historical fashion is impressive!' };
    if (avg >= 600) return { title: 'Fashion Scholar', description: 'You have a solid understanding of fashion origins.' };
    if (avg >= 400) return { title: 'Fashion Enthusiast', description: 'You know your way around fashion history.' };
    if (avg >= 200) return { title: 'Fashion Student', description: 'You\'re learning about global fashion traditions.' };
    return { title: 'Fashion Novice', description: 'There\'s a world of fashion history to explore!' };
  };
  
  const rank = getRank(averageScore);
  
  // Get the best round
  const bestRound = [...roundHistory].sort((a, b) => b.score - a.score)[0];
  
  return (
    <motion.div
      className="w-full max-w-3xl mx-auto my-8 border border-yellow rounded-lg bg-black/50 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center text-yellow mb-6">Game Results</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
          <div className="bg-black/30 rounded-lg p-6 text-center flex-1">
            <div className="text-xl mb-2">Final Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
              {formatScore(totalScore)}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-6 text-center flex-1">
            <div className="text-xl mb-2">Average Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(averageScore)}`}>
              {formatScore(averageScore)}
            </div>
          </div>
        </div>
        
        <div className="mb-8 text-center">
          <div className="inline-block bg-yellow/10 rounded-full px-4 py-2 mb-2">
            <span className="text-yellow">
              <Award className="inline mr-2 h-5 w-5" />
              Your Rank
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{rank.title}</h3>
          <p className="text-yellow">{rank.description}</p>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-yellow">Round Breakdown</h3>
          <div className="space-y-3">
            {roundHistory.map((round: RoundResult, index: number) => (
              <div key={index} className="flex items-center bg-black/20 rounded-md p-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 text-white">
                  #{index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-white font-medium">{round.item.country}</div>
                  <div className="text-sm text-yellow">
                    {typeof round.guess === 'string' ? (
                      round.guess
                    ) : (
                      <span className="flex items-center">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {round.guess.lat.toFixed(1)}, {round.guess.lng.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(round.score)}`}>
                  {formatScore(round.score)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {bestRound && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-yellow">Best Guess</h3>
            <div className="bg-black/20 p-4 rounded-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/3">
                  <img 
                    src={bestRound.item.primaryImage} 
                    alt={bestRound.item.title}
                    className="w-full h-auto object-cover rounded-md"
                  />
                </div>
                <div className="sm:w-2/3">
                  <h4 className="text-lg font-semibold">{bestRound.item.title}</h4>
                  <p className="text-yellow mb-2">{bestRound.item.country}</p>
                  <p className="text-sm mb-3">
                    {bestRound.item.objectDate && `${bestRound.item.objectDate} • `}
                    {bestRound.item.medium}
                  </p>
                  <div className={`text-2xl font-bold ${getScoreColor(bestRound.score)}`}>
                    Score: {formatScore(bestRound.score)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={restartGame}
        className="w-full bg-yellow hover:bg-yellow text-black font-semibold py-4 flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Play Again
      </button>
    </motion.div>
  );
};

export default GameOverPanel; 