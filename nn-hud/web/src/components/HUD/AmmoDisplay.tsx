import React, { useState, useEffect } from 'react';
import './AmmoDisplay.css';
import AmmoBulletsSvg from '../svgs/ammobullets.svg';
import { getCSSVariable } from '../../utils/colorUtils';

interface AmmoDisplayProps {
  currentAmmo: number;
  reserveAmmo: number;
}

export const AmmoDisplay: React.FC<AmmoDisplayProps> = ({ 
  currentAmmo = 0, 
  reserveAmmo = 0 
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [prevAmmo, setPrevAmmo] = useState(currentAmmo);

  // Trigger shake animation when ammo decreases (shooting)
  useEffect(() => {
    if (currentAmmo < prevAmmo) {
      // For rapid fire/continuous shooting, restart animation each time
      setIsShaking(false); // Reset first to restart animation
      
      // Use requestAnimationFrame to ensure state update processes
      requestAnimationFrame(() => {
        setIsShaking(true);
        
        // Remove shake class after animation completes
        const timeout = setTimeout(() => {
          setIsShaking(false);
        }, 150); // Shorter duration for rapid fire responsiveness
        
        return () => clearTimeout(timeout);
      });
    }
    setPrevAmmo(currentAmmo);
  }, [currentAmmo, prevAmmo]);

  return (
    <div className="ammo-display-container">
      {/* Ammo Bullets SVG Icon */}
      <div className="bullet-svg-container">
        <img 
          src={AmmoBulletsSvg} 
          alt="Ammo Bullets" 
          className={`bullet-svg ${isShaking ? 'shooting' : ''}`}
          style={{
            filter: `brightness(0) saturate(100%) invert(1) sepia(100%) hue-rotate(120deg) brightness(0.9) contrast(1.3) drop-shadow(0 0 3px ${getCSSVariable('--hud-ammo-color', '#f97316')})`
          }}
        />
      </div>
      
      {/* Ammo Counts */}
      <div className="ammo-counts">
        {/* Current Ammo Count */}
        <div 
          className={`current-ammo ${isShaking ? 'shake' : ''}`}
          style={{
            color: getCSSVariable('--hud-ammo-color', '#f97316'),
            textShadow: `0 0 8px ${getCSSVariable('--hud-ammo-color', '#f97316')}, 0 0 16px ${getCSSVariable('--hud-ammo-color', '#f97316')}`
          }}
        >
          {currentAmmo}
        </div>
        
        {/* Reserve Ammo Count */}
        <div className="reserve-ammo">{reserveAmmo}</div>
      </div>
    </div>
  );
};

export default AmmoDisplay; 