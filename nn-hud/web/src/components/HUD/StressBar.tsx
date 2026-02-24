import React from 'react';
import { Brain } from 'lucide-react';
import { getCSSVariable, getCSSVariableWithAlpha } from '../../utils/colorUtils';

interface StressBarProps {
  value: number;
  maxValue?: number;
  className?: string;
}

export const StressBar: React.FC<StressBarProps> = ({
  value,
  maxValue = 100,
  className = ''
}) => {
  const percentage = (value / maxValue) * 100;
  const isHigh = percentage > 80;
  const isMedium = percentage > 50;

  const getColor = () => {
    return isHigh 
      ? 'from-red-600 to-red-500' 
      : isMedium 
      ? 'from-purple-500 to-red-400' 
      : 'from-blue-500 to-purple-400';
  };

  const getIconColor = () => {
    return isHigh ? 'text-red-500' : isMedium ? 'text-purple-500' : 'text-blue-500';
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
              ${isHigh ? 'animate-pulse' : ''}
            `}
            style={{ 
              height: `${percentage}%`,
              background: isHigh 
                ? 'linear-gradient(to top, #dc2626, #ef4444)' 
                : `linear-gradient(to top, ${getCSSVariable('--hud-stress-color', '#8b5cf6')}, ${getCSSVariable('--hud-stress-color', '#8b5cf6')})`,
              boxShadow: isHigh 
                ? '0 0 8px rgba(239, 68, 68, 0.8)' 
                : `0 0 6px ${getCSSVariableWithAlpha('--hud-stress-color', '#8b5cf6', 0.6)}`
            }}
          />

          {/* Critical State Effects */}
          {isHigh && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 w-px h-full bg-red-900 opacity-60 animate-pulse" />
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={`${getIconColor()} ${isHigh ? 'animate-pulse' : ''}`}>
          <Brain className="w-5 h-5" style={{ color: '#f1eee2' }} />
        </div>
      </div>
    </div>
  );
}; 