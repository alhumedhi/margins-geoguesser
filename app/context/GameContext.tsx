import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MetObject } from '../components/types/met';
import { fetchCostumeImages } from '../lib/api';
import { calculateExponentialScore } from '../lib/utils';

// Different phases of the game
export type GamePhase = 'loading' | 'playing' | 'feedback' | 'gameOver';

// Store result of each round
export interface RoundResult {
  item: MetObject;
  guess: { lat: number; lng: number } | string;
  score: number;
  distance?: number;
}

// Game state interface
interface GameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  roundHistory: RoundResult[];
  timerActive: boolean;
  timeRemaining: number;
  lastGuess: { lat: number; lng: number } | string | null;
  items: MetObject[];
}

// Game context interface
interface GameContextType {
  // State
  phase: GamePhase;
  currentItem: MetObject | null;
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  roundHistory: RoundResult[];
  loading: boolean;
  lastGuess: { lat: number; lng: number } | string | null;
  error: string | null;
  timeRemaining: number;
  timerActive: boolean;
  
  // Actions
  makeGuess: (guess: { lat: number; lng: number } | string) => void;
  nextRound: () => void;
  restartGame: () => void;
  handleTimeEnd: () => void;
}

// Create context with default values
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    phase: 'loading',
    currentRound: 1,
    totalRounds: 5,
    totalScore: 0,
    roundHistory: [],
    timerActive: false,
    timeRemaining: 30, // 30 seconds per round
    lastGuess: null,
    items: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.phase === 'playing' && state.timerActive && state.timeRemaining > 0) {
      timer = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (state.timeRemaining === 0 && state.phase === 'playing') {
      // Time's up! Automatically submit a guess
      makeGuess({ lat: 0, lng: 0 }); // Default guess when time runs out
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.phase, state.timerActive, state.timeRemaining]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('GameContext: Starting to load data');
        setLoading(true);
        setState(prev => ({ ...prev, phase: 'loading' }));
        setState(prev => ({ ...prev, items: [] })); // Reset items to avoid stale data
        
        // Fetch items with a buffer to ensure we have enough valid items
        const fetchedItems = await fetchCostumeImages(state.totalRounds + 2); // Add buffer for potential invalid items
        
        if (fetchedItems.length >= state.totalRounds) {
          console.log('GameContext: Setting items and moving to playing phase');
          setState(prev => ({ 
            ...prev, 
            phase: 'playing',
            timerActive: true,
            timeRemaining: 30
          }));
          console.log(`GameContext: Successfully loaded ${fetchedItems.length} costume items`);
        } else {
          // Instead of showing an error, keep trying to fetch items
          console.log('GameContext: Not enough items found, retrying...');
          setTimeout(loadData, 2000); // Retry after 2 seconds
        }
      } catch (err) {
        console.error('GameContext: Error loading data:', err);
        // Instead of showing an error, keep trying to fetch items
        setTimeout(loadData, 2000); // Retry after 2 seconds
      }
    };

    loadData();
  }, []);

  // Current item getter
  const currentItem = state.items[state.currentRound - 1] || null;
  
  // Debug logging for phase changes
  useEffect(() => {
    console.log(`GameContext: Phase changed to: ${state.phase}`);
  }, [state.phase]);
  
  // Debug logging for items
  useEffect(() => {
    console.log(`GameContext: Items updated, count: ${state.items.length}`);
    if (state.items.length > 0) {
      console.log('GameContext: First item:', state.items[0]?.title);
    }
  }, [state.items]);
  
  // Handle user guess submission
  const makeGuess = (guess: { lat: number; lng: number } | string) => {
    if (!currentItem || state.phase !== 'playing') return;
    
    setState(prev => ({ ...prev, lastGuess: guess, timerActive: false }));
    
    let score = 0;
    let distance: number | undefined = undefined;
    
    // Calculate score based on guess type
    if (typeof guess === 'string') {
      // String guess is a country name
      const isCorrect = guess.toLowerCase() === (currentItem.country || '').toLowerCase();
      score = isCorrect ? 1000 : 0;
    } else if (currentItem.geographyLat !== undefined && currentItem.geographyLng !== undefined) {
      // Coordinate guess uses distance calculation
      const actualCoords = {
        lat: currentItem.geographyLat,
        lng: currentItem.geographyLng
      };
      
      score = calculateExponentialScore(actualCoords, guess);
      
      // Calculate distance for feedback
      const R = 6371; // Earth's radius in km
      const dLat = (guess.lat - actualCoords.lat) * Math.PI / 180;
      const dLng = (guess.lng - actualCoords.lng) * Math.PI / 180;
      
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(actualCoords.lat * Math.PI / 180) * 
        Math.cos(guess.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
    } else {
      console.log(`Couldn't extract coordinates for object ${currentItem?.objectID} (${currentItem?.title})`);
    }
    
    // Update total score
    setState(prev => ({ ...prev, totalScore: prev.totalScore + score }));
    
    // Store round result
    const result: RoundResult = {
      item: currentItem,
      guess,
      score,
      distance
    };
    
    setState(prev => ({ ...prev, roundHistory: [...prev.roundHistory, result] }));
    setState(prev => ({ ...prev, phase: 'feedback' }));
  };
  
  // Move to next round
  const nextRound = () => {
    if (state.currentRound >= state.totalRounds) {
      setState(prev => ({ ...prev, phase: 'gameOver' }));
    } else {
      setState(prev => ({ 
        ...prev, 
        currentRound: prev.currentRound + 1,
        lastGuess: null,
        phase: 'playing',
        timerActive: true,
        timeRemaining: 30
      }));
    }
  };
  
  // Restart the game
  const restartGame = async () => {
    setLoading(true);
    setState(prev => ({ 
      ...prev, 
      phase: 'loading',
      currentRound: 1,
      totalScore: 0,
      roundHistory: [],
      lastGuess: null,
      timerActive: false,
      timeRemaining: 30
    }));
    setState(prev => ({ ...prev, items: [] })); // Reset items
    
    try {
      const fetchedItems = await fetchCostumeImages(state.totalRounds + 2);
      
      if (fetchedItems.length >= state.totalRounds) {
        setState(prev => ({ 
          ...prev, 
          phase: 'playing',
          timerActive: true
        }));
      } else {
        console.error('Not enough valid items found');
        setError("Could not load costume data from MET API. Please try again later.");
      }
    } catch (error) {
      console.error('Error restarting game:', error);
      setError("Could not load costume data from MET API. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      timerActive: false,
      phase: 'feedback'
    }));
  }, []);

  // Context value
  const value: GameContextType = {
    phase: state.phase,
    currentItem,
    currentRound: state.currentRound,
    totalRounds: state.totalRounds,
    totalScore: state.totalScore,
    roundHistory: state.roundHistory,
    loading,
    lastGuess: state.lastGuess,
    error,
    timeRemaining: state.timeRemaining,
    timerActive: state.timerActive,
    makeGuess,
    nextRound,
    restartGame,
    handleTimeEnd
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom hook for using the game context
export function useGame() {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
} 