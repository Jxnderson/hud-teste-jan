import React from 'react';
import { OxygenIcon } from './OxygenIcon';
import { getCSSVariable, getCSSVariableWithAlpha } from '../../utils/colorUtils';

interface StaminaBarProps {
  value: number;
  maxValue?: number;
  className?: string;
}

export const StaminaBar: React.FC<StaminaBarProps> = ({
  value,
  maxValue = 100,
  className = ''
}) => {
  const percentage = (value / maxValue) * 100;
  const isCritical = percentage <= 20;
  const isLow = percentage <= 50;



  const getIconColor = () => {
    return isCritical ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-green-500';
  };

  return (
    <div className={`inline-flex flex-col items-center space-y-1 ${className}`}>
      {/* Progress Bar and Icon Container */}
      <div className="flex items-center space-x-1">
        {/* Progress Bar */}
        <div className="relative w-[6px] h-8 bg-gray-900 rounded overflow-hidden shadow-lg">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800/20 to-transparent" />
          
          {/* Status Fill */}
          <div
            className={`
              absolute bottom-0 left-0 w-full transition-all duration-500 ease-out
              ${isCritical ? 'animate-pulse' : ''}
            `}
            style={{ 
              height: `${percentage}%`,
              background: isCritical 
                ? 'linear-gradient(to top, #dc2626, #ef4444)' 
                : `linear-gradient(to top, ${getCSSVariable('--hud-stamina-color', '#10b981')}, ${getCSSVariable('--hud-stamina-color', '#10b981')})`,
              boxShadow: isCritical 
                ? '0 0 8px rgba(239, 68, 68, 0.8)' 
                : `0 0 6px ${getCSSVariableWithAlpha('--hud-stamina-color', '#10b981', 0.6)}`
            }}
          />
        </div>

        {/* Icon */}
        <div className={`${getIconColor()} ${isCritical ? 'animate-pulse' : ''}`}>
          <OxygenIcon className="w-6 h-6" style={{ color: '#f1eee2' }} />
        </div>
      </div>
    </div>
  );
}; 