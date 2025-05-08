import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Globe from 'globe.gl';
import { useGame } from '../context/GameContext';

const GlobeComponent: React.FC = () => {
  const globeRef = useRef<HTMLDivElement>(null);
  const { makeGuess, phase } = useGame();

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight)
      .pointAltitude(0.1)
      .pointColor(() => '#ffd700')
      .pointsData([])
      .onPointClick(({ lat, lng }) => {
        if (phase === 'playing') {
          makeGuess(lat, lng);
        }
      });

    globeRef.current.appendChild(globe.renderer().domElement);

    // Handle window resize
    const handleResize = () => {
      if (globeRef.current) {
        globe.width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeRef.current) {
        globeRef.current.removeChild(globe.renderer().domElement);
      }
    };
  }, [makeGuess, phase]);

  return (
    <motion.div
      ref={globeRef}
      className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden border-2 border-yellow"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
};

export default GlobeComponent; 