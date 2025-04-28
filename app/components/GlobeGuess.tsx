import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

// Define type for markers to fix the color property error
interface GlobeMarker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  size: number;
}

// Dynamic import of Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-black/20 rounded-lg border border-yellow">
      <div className="text-yellow animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>Loading Globe...</span>
      </div>
    </div>
  )
});

const GlobeGuess: React.FC = () => {
  const { makeGuess, phase, currentItem, lastGuess } = useGame();
  const globeRef = useRef<any>(null);
  const [markerCoords, setMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGlobeReady, setIsGlobeReady] = useState(false);

  // Reset marker when current item changes
  useEffect(() => {
    setMarkerCoords(null);
  }, [currentItem]);
  
  // Set initial globe position
  useEffect(() => {
    if (globeRef.current && isGlobeReady) {
      // Position globe to show most of the populated world
      globeRef.current.pointOfView({ lat: 30, lng: 10, altitude: 2.5 });
      
      // Globe only becomes interactive once it's ready
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, [isGlobeReady]);
  
  // Stop rotation when marker is placed
  useEffect(() => {
    if (globeRef.current && markerCoords && isGlobeReady) {
      globeRef.current.controls().autoRotate = false;
    }
  }, [markerCoords, isGlobeReady]);

  const handleGlobeClick = (coords: any) => {
    // Only allow placing markers in 'playing' phase
    if (phase !== 'playing') return;
    
    const { lat, lng } = coords;
    setMarkerCoords({ lat, lng });
    
    // Focus on the selected area
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat, lng, altitude: 1.5 });
    }
  };

  const handleSubmit = () => {
    if (markerCoords && phase === 'playing') {
      makeGuess(markerCoords);
    }
  };

  // Prepare markers for the globe
  const getMarkers = (): GlobeMarker[] => {
    const markers: GlobeMarker[] = [];
    
    // User's guess marker
    if (markerCoords) {
      markers.push({
        id: 'guess',
        lat: markerCoords.lat,
        lng: markerCoords.lng,
        color: 'yellow',
        size: 0.2
      });
    }
    
    // Show correct location after guess is made (during feedback phase)
    if (phase === 'feedback' && currentItem?.geographyLat && currentItem?.geographyLng) {
      markers.push({
        id: 'actual',
        lat: currentItem.geographyLat,
        lng: currentItem.geographyLng,
        color: 'lime',
        size: 0.2
      });
      
      // Also show the user's guess during feedback
      if (typeof lastGuess === 'object' && lastGuess !== null) {
        markers.push({
          id: 'lastGuess',
          lat: lastGuess.lat,
          lng: lastGuess.lng,
          color: 'red',
          size: 0.2
        });
      }
    }
    
    return markers;
  };

  return (
    <motion.div 
      className="mt-8 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h3 className="text-xl font-semibold mb-3 text-yellow">Place a Pin on the Globe</h3>
      
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-yellow">
        <div className="absolute inset-0 z-10">
          {typeof window !== 'undefined' && (
            <Globe
              ref={globeRef}
              width={800}
              height={400}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              backgroundColor="rgba(0,0,0,0)"
              onGlobeClick={handleGlobeClick}
              pointsData={getMarkers()}
              pointColor={(obj: object) => {
                // Type assertion to access the color property while maintaining compatibility
                return (obj as GlobeMarker).color || 'white';
              }}
              pointAltitude={0.01}
              pointRadius={0.5}
              onGlobeReady={() => setIsGlobeReady(true)}
              pointLabel={() => ''}
            />
          )}
        </div>
        
        {/* Instructions overlay */}
        {!markerCoords && phase === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/70 px-4 py-2 rounded-md text-yellow text-center">
              <MapPin className="inline-block mr-2 h-5 w-5" />
              Click on the globe to place your guess
            </div>
          </div>
        )}

        {/* Feedback overlay */}
        {phase === 'feedback' && currentItem && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 z-20">
            <div className="text-center text-sm">
              <span className="text-lime-400">● Actual location</span>
              <span className="mx-4 text-yellow">|</span>
              <span className="text-red-400">● Your guess</span>
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={handleSubmit} 
        className="mt-4 w-full bg-yellow hover:bg-yellow text-black font-semibold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!markerCoords || phase !== 'playing'}
      >
        Submit Pin Location
      </button>
    </motion.div>
  );
};

export default GlobeGuess; 