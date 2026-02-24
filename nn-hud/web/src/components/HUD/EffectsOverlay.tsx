import React from 'react';
import { PlayerStats } from './types';

interface EffectsOverlayProps {
  stats: PlayerStats;
}

export const EffectsOverlay: React.FC<EffectsOverlayProps> = ({ stats }) => {
  const healthPercentage = (stats.health / stats.maxHealth) * 100;
  const isCriticalHealth = healthPercentage <= 30;
  const isLowHealth = healthPercentage <= 50;
  const isLowOxygen = stats.oxygen <= 20;
  const isHighStress = stats.stress > 80;
  const isStarving = stats.hunger <= 20;
  const isDehydrated = stats.thirst <= 20;

  const shouldBlur = isCriticalHealth && (isStarving || isDehydrated);
  const shouldShake = isCriticalHealth && isLowOxygen;

  return (
    <>
      {/* Screen Blur Effect */}
      {shouldBlur && (
        <div className="fixed inset-0 backdrop-blur-sm pointer-events-none z-40 animate-pulse" />
      )}

      {/* Screen Shake Effect */}
      {shouldShake && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div className="w-full h-full animate-shake bg-transparent" />
        </div>
      )}

      {/* Stress Visual Distortion */}
      {isHighStress && (
        <div className="fixed inset-0 pointer-events-none z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-purple-900/10 animate-pulse" />
        </div>
      )}

      {/* Low Oxygen Blue Tint */}
      {isLowOxygen && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-blue-900/20 animate-pulse" />
        </div>
      )}

      {/* Grain Effect for Multiple Critical States */}
      {(isCriticalHealth && (isStarving || isDehydrated)) && (
        <div className="fixed inset-0 pointer-events-none z-60 opacity-30">
          <div className="w-full h-full bg-noise animate-pulse" />
        </div>
      )}
    </>
  );
};