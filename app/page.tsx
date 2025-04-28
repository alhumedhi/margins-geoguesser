"use client";

import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HomePage from './components/HomePage'; 
import CostumeDisplay from './components/CostumeDisplay';
import CountryGuess from './components/CountryGuess';
import GlobeGuess from './components/GlobeGuess';
import FeedbackPanel from './components/FeedbackPanel';
import GameOverPanel from './components/GameOverPanel';
import GuessResultPopup from './components/GuessResultPopup';
import Timer from './components/Timer';
import { formatScore, formatTime } from './lib/utils';

// Main game component that uses the game context
const GameContent = () => {
  const { 
    phase, 
    totalScore, 
    loading, 
    error, 
    currentItem, 
    currentRound,
    totalRounds,
    makeGuess,
    nextRound,
    timerActive,
    handleTimeEnd
  } = useGame();
  
  const [showHomePage, setShowHomePage] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // Handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining, handleTimeEnd]);
  
  // Reset timer when phase changes to playing
  useEffect(() => {
    if (phase === 'playing') {
      setTimeRemaining(30);
    }
  }, [phase]);
  
  // Show game over screen
  if (phase === 'gameOver') {
    return <GameOverPanel />;
  }

  // Show error message if there's an error
  const errorDisplay = error && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-black border border-red-500 p-8 rounded-lg max-w-md">
        <h2 className="text-xl text-red-500 mb-4">Error Loading Game</h2>
        <p className="text-white mb-4">{error}</p>
        <p className="text-yellow text-sm mb-6">Check the browser console for more details (F12)</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-yellow text-black py-2 px-4 rounded w-full"
        >
          Reload Game
        </button>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="flex flex-col min-h-screen bg-black p-8 md:p-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow">margins geoguesser</h1>
        
        {/* Score and Timer Container */}
        <div className="score-time-container bg-yellow/10 rounded-lg px-4 py-2 flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="text-yellow mr-2 minimal-text">Current Score</div>
            <div className="text-xl font-bold text-yellow">{formatScore(totalScore)}</div>
          </div>
          {phase === 'playing' && (
            <div className="flex items-center">
              <div className="text-yellow mr-2 minimal-text">Time Remaining</div>
              <div className="text-xl font-bold text-yellow">{formatTime(timeRemaining)}</div>
            </div>
          )}
        </div>
        
        {/* Game content */}
        <div className="flex flex-col lg:flex-row w-full gap-12">
          {/* Left side - Image display (1/3 width) */}
          <div className="w-full lg:w-1/3">
            <CostumeDisplay />
            {phase === 'feedback' && <FeedbackPanel />}
          </div>
          
          {/* Right side - Interaction area */}
          <div className="w-full lg:w-2/3">
            {(phase === 'playing' || phase === 'feedback') && (
              <>
                {/* Globe */}
                <div className="mb-8 h-[400px]">
                  <GlobeGuess />
                </div>
                
                {/* Only show guess interfaces during playing phase */}
                {phase === 'playing' && (
                  <div className="space-y-6">
                    <CountryGuess />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Guess Result Popup */}
        {phase === 'feedback' && currentItem && (
          <GuessResultPopup
            item={currentItem}
            score={totalScore}
            roundsLeft={totalRounds - currentRound}
            onContinue={nextRound}
          />
        )}
      </div>

      {/* Show Home Page overlay */}
      {showHomePage && <HomePage onStartGame={() => setShowHomePage(false)} />}
      
      {/* Show Error Message */}
      {errorDisplay}
    </>
  );
};

// Page component that wraps the game with the provider
export default function FashionHistoryGame() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
