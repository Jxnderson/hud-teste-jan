import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { HealthBarProps } from './types';
import { getCSSVariable, getCSSVariableWithAlpha } from '../../utils/colorUtils';

export const HealthBar: React.FC<HealthBarProps> = ({
  health,
  maxHealth,
  isHealing = false,
  inLastStand = false,
  className = ''
}) => {
  // Ensure health values are valid numbers
  const safeHealth = Math.max(0, Math.min(health || 0, maxHealth || 100));
  const safeMaxHealth = maxHealth || 100;
  
  const healthPercentage = inLastStand ? 100 : (safeHealth / safeMaxHealth) * 100;
  const isCritical = healthPercentage <= 30;
  const isLow = healthPercentage <= 50;
  const isDead = healthPercentage <= 0;
  
  const [previousHealth, setPreviousHealth] = useState(safeHealth);
  const [isLossingHP, setIsLossingHP] = useState(false);
  const [isGainingHP, setIsGainingHP] = useState(false);

  // Track health changes for real-time visual feedback
  useEffect(() => {
    const healthDifference = safeHealth - previousHealth;
    
    if (healthDifference < 0) {
      // Health decreased - damage effect
      setIsLossingHP(true);
      setIsGainingHP(false);
      
      // Remove damage effect after animation
      const timeout = setTimeout(() => {
        setIsLossingHP(false);
      }, 600); // Shorter duration for more responsive feedback
      
      return () => clearTimeout(timeout);
    } else if (healthDifference > 0) {
      // Health increased - healing effect
      setIsGainingHP(true);
      setIsLossingHP(false);
      
      // Remove healing effect after animation
      const timeout = setTimeout(() => {
        setIsGainingHP(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
    
    setPreviousHealth(safeHealth);
  }, [safeHealth, previousHealth]);

  return (
    <div className={`flex items-center ${className}`}>
      {/* Health Icon */}
      <Heart 
        className="w-5 h-5"
        style={{ color: '#f1eee2' }}
        fill="currentColor"
      />

      {/* Health Percentage */}
      <span className={`text-sm ml-2 min-w-[35px] ${
        isDead || inLastStand ? 'animate-pulse text-red-500' : 
        isCritical ? 'animate-pulse' : ''
      }`}
        style={{
          color: isDead || inLastStand ? '#ef4444' : getCSSVariable('--hud-health-color', '#25d489'),
          textShadow: isDead || inLastStand
            ? '0 0 15px rgba(239, 68, 68, 0.8), 0 0 6px rgba(239, 68, 68, 0.6)' 
            : isCritical 
            ? `0 0 20px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.8)}, 0 0 8px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.6)}` 
            : isLow
            ? `0 0 15px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.8)}, 0 0 6px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.6)}`
            : `0 0 12px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.8)}, 0 0 6px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.6)}`,
          fontFamily: '"Gilroy-SemiBold", sans-serif'
        }}
      >
        {isDead || inLastStand ? '0' : Math.round(safeHealth / safeMaxHealth * 100)}
      </span>

      {/* Health Bar Container */}
      <div 
        className={`relative flex-1 h-2 bg-gray-900 rounded-lg overflow-hidden shadow-lg ${
          isLossingHP ? 'animate-damage-effect' : 
          isGainingHP ? 'animate-healing-effect' : ''
        }`}
        style={{ 
          // Remove glow from container - only the fill should glow
        }}
      >
        {/* Background Glow */}
        <div className={`absolute inset-0`}
          style={{
            background: inLastStand
              ? 'linear-gradient(to right, rgba(239, 68, 68, 0.5), rgba(239, 68, 68, 0.4), rgba(239, 68, 68, 0.3))'
              : isCritical 
              ? `linear-gradient(to right, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.5)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.4)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.3)})`
              : `linear-gradient(to right, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.3)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.2)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.1)})`
          }}
        />
        
        {/* Health Fill - Enhanced with Real-time Feedback */}
        <div
          className={`
            absolute left-0 top-0 h-full transition-all ease-out
            ${isDead ? 'duration-300' : 'duration-200'}
            ${isCritical ? 'animate-pulse animate-bounce' : ''}
            ${isHealing || isGainingHP ? 'animate-healing-effect' : ''}
          `}
          style={{
            width: `${healthPercentage}%`,
            background: isDead || inLastStand
              ? 'linear-gradient(to right, #ef4444, #dc2626, #b91c1c)' // Red when dead or in last stand
              : `linear-gradient(to right, ${getCSSVariable('--hud-health-color', '#25d489')}, ${getCSSVariable('--hud-health-color', '#25d489')}, ${getCSSVariable('--hud-health-color', '#25d489')})`,
            boxShadow: isDead || inLastStand
              ? '0 0 15px rgba(239, 68, 68, 0.8), 0 0 6px rgba(239, 68, 68, 0.6)'
              : isCritical 
              ? `0 0 20px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.8)}, 0 0 8px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.6)}`
              : isLow
              ? `0 0 15px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.8)}, 0 0 6px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.6)}`
              : isHealing || isGainingHP
              ? `0 0 20px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.8)}, 0 0 8px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.6)}`
              : `0 0 12px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.8)}, 0 0 6px ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.6)}`,
            filter: isDead || inLastStand
              ? 'brightness(0.8) saturate(1.5)'
              : isCritical 
              ? 'brightness(1.2) saturate(1.3)' 
              : isLow 
              ? 'brightness(1.1) saturate(1.2)' 
              : 'none'
          }}
        >
          {/* Texture Overlay - Enhanced for different health states */}
          <div className={`absolute inset-0`}
            style={{
              background: isDead || inLastStand
                ? 'linear-gradient(to bottom, rgba(239, 68, 68, 0.4), rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.5))'
                : isCritical 
                ? `linear-gradient(to bottom, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.3)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.2)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.4)})`
                : isLow 
                ? `linear-gradient(to bottom, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.25)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.15)}, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.3)})`
                : `linear-gradient(to bottom, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.2)}, transparent, ${getCSSVariableWithAlpha('--hud-health-color', '#25d489', 0.2)})`
            }}
          />
          
          {/* Drip Effect for Critical Health */}
          {/* {isCritical && (
            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-1/4 w-px h-1 opacity-70 animate-pulse" style={{ backgroundColor: '#2acb79' }} />
              <div className="absolute bottom-0 left-1/2 w-px h-2 opacity-80 animate-pulse animation-delay-200" style={{ backgroundColor: '#2acb79' }} />
              <div className="absolute bottom-0 left-3/4 w-px h-1 opacity-60 animate-pulse animation-delay-400" style={{ backgroundColor: '#2acb79' }} />
            </div>
          )} */}
          
          {/* Healing Sparkle Effect */}
          {isHealing && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full animate-ping opacity-75" style={{ backgroundColor: getCSSVariable('--hud-health-color', '#25d489') }} />
              <div className="absolute top-1/4 left-1/2 w-1 h-1 rounded-full animate-ping opacity-50 animation-delay-200" style={{ backgroundColor: getCSSVariable('--hud-health-color', '#25d489') }} />
              <div className="absolute top-3/4 left-3/4 w-1.5 h-1.5 rounded-full animate-ping opacity-60 animation-delay-400" style={{ backgroundColor: getCSSVariable('--hud-health-color', '#25d489') }} />
            </div>
          )}
        </div>


      </div>
    </div>
  );
};