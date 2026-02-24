import React from 'react';
import { Utensils } from 'lucide-react';
import { getCSSVariable, getCSSVariableWithAlpha } from '../../utils/colorUtils';

interface HungerBarProps {
  value: number;
  maxValue?: number;
  className?: string;
}

export const HungerBar: React.FC<HungerBarProps> = ({
  value,
  maxValue = 100,
  className = ''
}) => {
  const percentage = (value / maxValue) * 100;
  const isCritical = percentage <= 20;
  const isLow = percentage <= 50;

  const getColor = () => {
    return { 
      background: `linear-gradient(to top, ${getCSSVariable('--hud-hunger-color', '#f59e0b')}, ${getCSSVariable('--hud-hunger-color', '#f59e0b')})` 
    };
  };

  const getIconColor = () => {
    return isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-green-500';
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
            `}
            style={{ 
              height: `${percentage}%`,
              animation: isCritical ? 'pulse 8s cubic-bezier(0.3, 0.8, 0.3, 2.3) infinite' : 'none',
              boxShadow: isCritical 
                ? '0 0 8px rgba(239, 68, 68, 0.8)' 
                : `0 0 6px ${getCSSVariableWithAlpha('--hud-hunger-color', '#f59e0b', 0.6)}`,
              ...getColor()
            }}
          />

          
        </div>

        {/* Icon */}
        <div className={`${getIconColor()} ${isCritical ? 'animate-bounce' : ''}`}>
          <Utensils className="w-5 h-5" style={{ color: '#f1eee2' }} />
        </div>
      </div>
    </div>
  );
}; 