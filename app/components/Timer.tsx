import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onTimeEnd: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, isActive, onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    if (!isActive) return;
    
    if (timeLeft <= 0) {
      onTimeEnd();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeEnd]);
  
  // Reset timer when it becomes active again
  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
    }
  }, [isActive, duration]);
  
  // Calculate percentage for progress bar
  const percentage = Math.max(0, (timeLeft / duration) * 100);
  
  // Determine color based on time left
  let barColor = '#EEFF00'; // neon yellow
  if (timeLeft < 10) barColor = '#EF4444'; // red
  else if (timeLeft < 20) barColor = '#F97316'; // orange
  
  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '4px'
      }}>
        <span style={{ 
          fontFamily: '"Times New Roman", Times, serif', 
          color: '#EEFF00', 
          letterSpacing: '-0.05em' 
        }}>
          Time    
        </span>
        <span style={{ 
          fontFamily: '"Times New Roman", Times, serif', 
          fontSize: '1 rem', 
          color: timeLeft < 10 ? '#EF4444' : '#EEFF00', 
          letterSpacing: '-0.05em' 
        }}>
          {timeLeft}s
        </span>
      </div>
      
      <div style={{ 
        height: '8px', 
        width: '100%', 
        backgroundColor: '#1F2937', 
        borderRadius: '9999px', 
        overflow: 'hidden' 
      }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            backgroundColor: barColor, 
            borderRadius: '9999px',
            transition: 'width 0.5s ease'
          }} 
        />
      </div>
    </div>
  );
};

export default Timer;
