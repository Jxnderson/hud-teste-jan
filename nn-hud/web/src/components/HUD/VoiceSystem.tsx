import React from 'react';
import './VoiceSystem.css';
import WalkieTalkieIcon from './WalkieTalkieIcon';

interface VoiceSystemProps {
  isSpeaking?: boolean;
  isRadioActive?: boolean;
  hasRadio?: boolean; // Show radio icon when player has radio
  voiceRange?: number; // 1-3 for whisper/normal/shout
}

export const VoiceSystem: React.FC<VoiceSystemProps> = ({ 
  isSpeaking = false,
  isRadioActive = false,
  hasRadio = false,
  voiceRange = 1
}) => {
  // Ensure voiceRange is a number
  const numericVoiceRange = typeof voiceRange === 'string' ? parseInt(voiceRange, 10) : voiceRange;
  

  

  
  // Determine the speaking state and type
  const getTalkingState = () => {
    // If both radio talking and regular talking are true, use radio (blue/aqua)
    if (isRadioActive && isSpeaking) return 'radio';
    // If only radio talking is true, use radio
    if (isRadioActive) return 'radio';
    // If only regular talking is true, use talking (green)
    if (isSpeaking) return 'talking';
    return 'idle';
  };

  const talkingState = getTalkingState();
  const isActive = talkingState !== 'idle';

  return (
    <div className="voice-system-container">
      
      {/* Radio Icon Indicator - Show when player has radio */}
      {hasRadio && (
        <div className="voice-icon-indicator radio">
          <WalkieTalkieIcon size={30} />
        </div>
      )}
      
      {/* Voice Activity Indicator - Vertical bars with pr-hud style animations */}
      <div className="voice-activity">
        {Array.from({ length: 7 }, (_, index) => (
          <div 
            key={index}
            className={`activity-bar ${isActive ? 'active' : ''} ${talkingState}`}
            style={{
              '--animation-delay': `${[0.3, 0.9, 0.1, 0.7, 0.4, 0.8, 0.2][index]}s`,
              '--animation-duration': `${[1.8, 1.2, 2.1, 1.5, 1.9, 1.3, 2.3][index]}s`,
              maxHeight: numericVoiceRange === 0 ? '50%' : numericVoiceRange === 1 ? '70%' : '100%'
            } as React.CSSProperties}
          ></div>
        ))}
      </div>
      
      {/* Voice Range Control - Horizontal bars */}
      <div className="voice-range">
        <div 
          className={`range-bar whisper ${numericVoiceRange >= 1 ? 'active' : ''}`}
        ></div>
        <div 
          className={`range-bar normal ${numericVoiceRange >= 2 ? 'active' : ''}`}
        ></div>
        <div 
          className={`range-bar shout ${numericVoiceRange >= 3 ? 'active' : ''}`}
        ></div>
      </div>
    </div>
  );
};

export default VoiceSystem; 