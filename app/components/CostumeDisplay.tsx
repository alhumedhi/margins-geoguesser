import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Info, Loader2 } from 'lucide-react';
import Image from 'next/image';

const CostumeDisplay: React.FC = () => {
  const { currentItem, currentRound, totalRounds, phase } = useGame();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentItem?.primaryImage) {
      // Ensure the URL is properly formatted for Next.js Image component
      const url = new URL(currentItem.primaryImage);
      setImageUrl(url.toString());
      setIsLoading(true);
      setImageError(false);
    }
  }, [currentItem?.primaryImage]);
  
  if (!currentItem) {
    return (
      <div className="w-full aspect-square bg-black/20 rounded-md border border-yellow flex items-center justify-center">
        <p className="text-yellow">No image available</p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neon-yellow-400">
          {phase === 'playing' ? 'Where is this from?' : 'Costume Origin'}
        </h2>
        
        <div className="text-yellow text-sm">
          Round {currentRound} of {totalRounds}
        </div>
      </div>
      
      <motion.div
        className="relative w-full rounded-lg overflow-hidden border-2 border-yellow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        key={currentItem.objectID}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 text-yellow animate-spin" />
          </div>
        )}
        
        {!imageError && imageUrl ? (
          <Image 
            src={imageUrl}
            alt={currentItem.title}
            width={500}
            height={500}
            className="w-full aspect-square object-contain bg-black"
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
            onLoadingComplete={() => setIsLoading(false)}
            priority
            quality={90}
          />
        ) : (
          <div className="w-full aspect-square bg-black/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-yellow mb-2">Image failed to load</p>
              <p className="text-yellow/70 text-sm">Try refreshing the page</p>
            </div>
          </div>
        )}
        
        {/* Show minimal info during playing phase */}
        {phase === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3">
            <h3 className="text-lg font-medium text-white truncate">{currentItem.title}</h3>
            
            {currentItem.objectDate && (
              <p className="text-sm text-yellow">
                {currentItem.objectDate}
              </p>
            )}
          </div>
        )}
        
        {/* Show more details during feedback phase */}
        {phase === 'feedback' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3">
            <h3 className="text-lg font-medium text-white">{currentItem.title}</h3>
            
            <div className="mt-1 flex items-start">
              <Info className="w-4 h-4 text-yellow mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-yellow">
                This item is from <span className="font-semibold text-yellow">{currentItem.country}</span>
                {currentItem.city && `, ${currentItem.city}`}
                {currentItem.culture && ` (${currentItem.culture})`}
              </p>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Display minimal metadata */}
      <div className="mt-4 text-sm text-yellow">
        {currentItem.department && (
          <p>The Metropolitan Museum of Art, {currentItem.department}</p>
        )}
      </div>
    </div>
  );
};

export default CostumeDisplay; 