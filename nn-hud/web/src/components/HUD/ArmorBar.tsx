import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { ArmorBarProps } from './types';
import { getCSSVariable, getCSSVariableWithAlpha } from '../../utils/colorUtils';

interface FallingSegment {
  id: string;
  position: number;
  startTime: number;
}

export const ArmorBar: React.FC<ArmorBarProps> = ({
  armor,
  maxArmor,
  isRepairing = false,
  className = ''
}) => {
  // Ensure armor values are valid numbers
  const safeArmor = Math.max(0, Math.min(armor || 0, maxArmor || 100));
  const safeMaxArmor = maxArmor || 100;
  
  const armorPercentage = (safeArmor / safeMaxArmor) * 100;
  const segments = 5;
  const segmentValue = safeMaxArmor / segments;
  const [fallingSegments, setFallingSegments] = useState<FallingSegment[]>([]);
  const [previousArmor, setPreviousArmor] = useState(safeArmor);

  // Track armor changes and create falling segments
  useEffect(() => {
    if (safeArmor < previousArmor) {
      const previousActiveSegments = Math.ceil(previousArmor / segmentValue);
      const currentActiveSegments = Math.ceil(safeArmor / segmentValue);
      
      // Create falling segments for lost segments
      const newFallingSegments: FallingSegment[] = [];
      for (let i = currentActiveSegments; i < previousActiveSegments; i++) {
        newFallingSegments.push({
          id: `falling-${Date.now()}-${i}`,
          position: i,
          startTime: Date.now()
        });
      }
      
      if (newFallingSegments.length > 0) {
        setFallingSegments(prev => [...prev, ...newFallingSegments]);
        
        // Remove falling segments after animation completes
        setTimeout(() => {
          setFallingSegments(prev => 
            prev.filter(segment => 
              !newFallingSegments.some(newSeg => newSeg.id === segment.id)
            )
          );
        }, 600);
      }
    }
    setPreviousArmor(safeArmor);
  }, [safeArmor, previousArmor, segmentValue]);
  
  return (
    <div className={`flex items-center ${className}`}>
      {/* Armor Icon */}
      <Shield 
        className="w-5 h-5"
        style={{ color: '#f1eee2' }}
        fill="currentColor"
      />

      {/* Armor Percentage */}
      <span className={`text-sm ml-2 min-w-[35px]`}
        style={{
          color: armorPercentage > 0 
            ? getCSSVariable('--hud-armor-color', '#7ec8f7')
            : armorPercentage > 0 
            ? '#f59e0b' 
            : '#6b7280',
          textShadow: armorPercentage > 50 
            ? `0 0 8px ${getCSSVariable('--hud-armor-color', '#7ec8f7')}` 
            : 'none',
          fontFamily: '"Gilroy-SemiBold", sans-serif'
        }}
      >
        {Math.round(armorPercentage)}
      </span>

      {/* Armor Bar Container */}
      <div className="relative flex-1 h-1">
        {/* Background Glow */}
        
        
        {/* Armor Segments */}
        <div className="flex h-full">
          {Array.from({ length: segments }, (_, i) => {
            const segmentStart = i * segmentValue;
            const isActive = safeArmor > segmentStart;
            const segmentHealth = Math.min(Math.max(safeArmor - segmentStart, 0), segmentValue) / segmentValue;
            
            return (
              <div
                key={i}
                className={`
                  flex-1 relative mx-1 first:ml-0 last:mr-0 transition-all duration-300
                  ${isActive ? 'opacity-100' : 'opacity-10'}
                `}
              >
                <div
                  className={`
                    h-full transition-all duration-500 ease-out rounded-full
                    ${isRepairing && isActive ? 'animate-pulse' : ''}
                  `}
                  style={{ 
                    background: isActive 
                      ? `linear-gradient(to top, ${getCSSVariable('--hud-armor-color', '#7ec8f7')}, ${getCSSVariable('--hud-armor-color', '#7ec8f7')})`
                      : '#4b5563',
                    width: `${isActive ? segmentHealth * 100 : 100}%`,
                    transformOrigin: 'left center',
                    boxShadow: isActive 
                      ? `0 0 12px ${getCSSVariableWithAlpha('--hud-armor-color', '#7ec8f7', 0.8)}, 0 0 6px ${getCSSVariableWithAlpha('--hud-armor-color', '#7ec8f7', 0.6)}` 
                      : 'none'
                  }}
                />
                

                
                {/* Repair Sparkles */}
                {isRepairing && isActive && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
                  </div>
                )}
              </div>
            );
          })}
        </div>


                
        {/* Falling Segments */}
        {fallingSegments.map((fallingSegment) => {
          const segmentWidth = `${100 / segments}%`;
          const leftPosition = `${(fallingSegment.position / segments) * 100}%`;
          
          return (
            <div
              key={fallingSegment.id}
              className="absolute top-0 pointer-events-none"
              style={{
                left: leftPosition,
                width: segmentWidth,
                height: '4px'
              }}
            >
              <div
                className="w-full h-full rounded-full animate-falling-segment"
                style={{
                  marginLeft: '4px',
                  marginRight: '4px',
                  background: `linear-gradient(to top, ${getCSSVariable('--hud-armor-color', '#7ec8f7')}, ${getCSSVariable('--hud-armor-color', '#7ec8f7')})`,
                  boxShadow: `0 0 8px ${getCSSVariableWithAlpha('--hud-armor-color', '#7ec8f7', 0.5)}`
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};