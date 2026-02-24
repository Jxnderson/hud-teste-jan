import React from 'react';

interface WalkieTalkieIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const WalkieTalkieIcon: React.FC<WalkieTalkieIconProps> = ({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 384 512"
      width={size}
      height={size}
      className={className}
      fill={color}
    >
      <path d="M112 24c0-13.3-10.7-24-24-24S64 10.7 64 24l0 72L48 96C21.5 96 0 117.5 0 144L0 300.1c0 12.7 5.1 24.9 14.1 33.9l3.9 3.9c9 9 14.1 21.2 14.1 33.9L32 464c0 26.5 21.5 48 48 48l224 0c26.5 0 48-21.5 48-48l0-92.1c0-12.7 5.1-24.9 14.1-33.9l3.9-3.9c9-9 14.1-21.2 14.1-33.9L384 144c0-26.5-21.5-48-48-48l-16 0c0-17.7-14.3-32-32-32s-32 14.3-32 32l-32 0c0-17.7-14.3-32-32-32s-32 14.3-32 32l-48 0 0-72zm0 136l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
    </svg>
  );
};

export default WalkieTalkieIcon; 