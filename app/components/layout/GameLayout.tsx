import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/app/context/GameContext';
import { cn } from '@/app/lib/utils';

interface GameLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children, className }) => {
  const { phase } = useGame();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'min-h-screen bg-black text-white p-4 md:p-8',
        'flex flex-col items-center justify-center',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
      
      {/* Content container */}
      <div className={cn(
        'relative z-10 w-full max-w-7xl mx-auto',
        'flex flex-col md:flex-row gap-6 md:gap-8',
        'min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]'
      )}>
        {/* Main content area */}
        <main className={cn(
          'flex-1',
          'flex flex-col gap-6',
          'w-full md:w-2/3',
          'order-2 md:order-1'
        )}>
          {/* Search bar container - shown above globe on mobile */}
          <div className="block md:hidden w-full">
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && child.type.name === 'CountrySearch') {
                return child;
              }
              return null;
            })}
          </div>

          {/* Globe and other content */}
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type.name !== 'CountrySearch') {
              return child;
            }
            return null;
          })}
        </main>

        {/* Sidebar */}
        <aside className={cn(
          'w-full md:w-1/3',
          'flex flex-col gap-6',
          'order-1 md:order-2'
        )}>
          {/* Search bar - shown in sidebar on desktop */}
          <div className="hidden md:block">
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && child.type.name === 'CountrySearch') {
                return child;
              }
              return null;
            })}
          </div>

          {/* Game info */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-yellow/20">
            <h1 className="text-2xl md:text-3xl font-bold text-yellow mb-2">
              Fashion History Game
            </h1>
            <p className="text-yellow/80 text-sm md:text-base">
              {phase === 'playing' 
                ? 'Guess the origin of historical fashion items'
                : 'Learn about fashion history through interactive gameplay'}
            </p>
          </div>

          {/* Game controls */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-yellow/20">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-yellow text-black rounded-md hover:bg-yellow/90 transition-colors"
              >
                New Game
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-transparent border border-yellow text-yellow rounded-md hover:bg-yellow/10 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default GameLayout; 