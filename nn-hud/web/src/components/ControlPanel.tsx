import React, { useRef, useEffect, useState } from 'react';
import { PlayerStats } from './HUD/types';
import { Heart, Shield, Activity, Gauge, Car, Move } from 'lucide-react';

interface ControlPanelProps {
  stats: PlayerStats;
  onStatsChange: (stats: PlayerStats | ((prev: PlayerStats) => PlayerStats)) => void;
  isHealing: boolean;
  isRepairing: boolean;
  isSpeaking: boolean;
  activeVoiceRanges: ('whisper' | 'normal' | 'shout')[];
  currentAmmo: number;
  reserveAmmo: number;
  isRadioOn: boolean;
  onHealingToggle: () => void;
  onRepairingToggle: () => void;
  onSpeakingToggle: () => void;
  onRadioToggle: () => void;
  onVoiceRangeToggle: (range: 'whisper' | 'normal' | 'shout') => void;
  onShoot: () => void;
  onReload: () => void;
  onPresetLoad: (preset: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  stats,
  onStatsChange,
  isHealing,
  isRepairing,
  isSpeaking,
  activeVoiceRanges,
  currentAmmo,
  reserveAmmo,
  isRadioOn,
  onHealingToggle,
  onRepairingToggle,
  onSpeakingToggle,
  onRadioToggle,
  onVoiceRangeToggle,
  onShoot,
  onReload,
  onPresetLoad
}) => {
  const accelerateIntervalRef = useRef<number | null>(null);
  const brakeIntervalRef = useRef<number | null>(null);
  const coastIntervalRef = useRef<number | null>(null);
  
  // Dragging state
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Initial position (top-4 right-4)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Vehicle state
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  
  // Shooting state for continuous fire
  const [isShooting, setIsShooting] = useState(false);
  const shootIntervalRef = useRef<number | null>(null);
  const handleStatChange = (stat: keyof PlayerStats, value: number) => {
    onStatsChange({
      ...stats,
      [stat]: Math.max(0, Math.min(value, stat === 'health' ? stats.maxHealth : stat === 'armor' ? stats.maxArmor : 100))
    });
  };

  // Shooting functions for continuous fire
  const startShooting = () => {
    if (shootIntervalRef.current || currentAmmo === 0) return;
    
    setIsShooting(true);
    // First shot immediately
    onShoot();
    
    // Continue shooting every 100ms (600 RPM realistic rate)
    shootIntervalRef.current = setInterval(() => {
      // Check if we still have ammo before each shot
      if (currentAmmo > 1) { // Check > 1 because we're about to subtract 1
        onShoot();
      } else {
        // Stop shooting when out of ammo
        stopShooting();
      }
    }, 100);
  };

  const stopShooting = () => {
    setIsShooting(false);
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
  };

  // Start coasting (natural deceleration when not accelerating or braking)
  const startCoasting = () => {
    if (coastIntervalRef.current) return;
    
    coastIntervalRef.current = setInterval(() => {
      onStatsChange((currentStats: PlayerStats) => {
        const currentSpeed = currentStats.speed;
        const currentRpm = currentStats.rpm;
        
        if (currentSpeed <= 0) {
          return { ...currentStats, speed: 0, rpm: Math.max(currentRpm - 0.01, 0.2) };
        }
        
        // Natural deceleration (air resistance, friction)
        const deceleration = Math.max(1, currentSpeed * 0.02); // Faster cars decelerate more
        const newSpeed = Math.max(currentSpeed - deceleration, 0);
        const newRpm = Math.max(currentRpm - 0.008, newSpeed > 0 ? 0.2 : 0.15); // Idle RPM when stopped
        
        return { ...currentStats, speed: newSpeed, rpm: newRpm };
      });
    }, 100);
  };

  const stopCoasting = () => {
    if (coastIntervalRef.current) {
      clearInterval(coastIntervalRef.current);
      coastIntervalRef.current = null;
    }
  };

  // Vehicle control functions
  const handleAccelerate = () => {
    if (accelerateIntervalRef.current) return;
    
    setIsAccelerating(true);
    setIsBraking(false);
    stopCoasting();
    
    accelerateIntervalRef.current = setInterval(() => {
      onStatsChange((currentStats: PlayerStats) => {
        const currentSpeed = currentStats.speed;
        const currentRpm = currentStats.rpm;
        
        // Consistent acceleration without speed limitation
        const acceleration = 5; // Constant acceleration rate
        const rpmIncrease = Math.max(0.01, 0.025 - (currentRpm * 0.01));
        
        const newSpeed = Math.min(currentSpeed + acceleration, 200);
        const newRpm = Math.min(currentRpm + rpmIncrease, 1);
        
        return { ...currentStats, speed: newSpeed, rpm: newRpm };
      });
    }, 100);
  };

  const stopAccelerate = () => {
    if (accelerateIntervalRef.current) {
      clearInterval(accelerateIntervalRef.current);
      accelerateIntervalRef.current = null;
    }
    setIsAccelerating(false);
    
    // Start coasting when not accelerating and not braking
    if (!isBraking) {
      startCoasting();
    }
  };

  const handleBrake = () => {
    if (brakeIntervalRef.current) return;
    
    setIsBraking(true);
    setIsAccelerating(false);
    stopCoasting();
    
    brakeIntervalRef.current = setInterval(() => {
      onStatsChange((currentStats: PlayerStats) => {
        const currentSpeed = currentStats.speed;
        const currentRpm = currentStats.rpm;
        
        if (currentSpeed <= 0) {
          return { ...currentStats, speed: 0, rpm: Math.max(currentRpm - 0.02, 0.15) };
        }
        
        // Active braking is much faster than coasting
        const brakeForce = Math.max(8, currentSpeed * 0.15); // Stronger braking at higher speeds
        const newSpeed = Math.max(currentSpeed - brakeForce, 0);
        const newRpm = Math.max(currentRpm - 0.02, newSpeed > 0 ? 0.2 : 0.15);
        
        return { ...currentStats, speed: newSpeed, rpm: newRpm };
      });
    }, 100);
  };

  const stopBrake = () => {
    if (brakeIntervalRef.current) {
      clearInterval(brakeIntervalRef.current);
      brakeIntervalRef.current = null;
    }
    setIsBraking(false);
    
    // Start coasting when not braking and not accelerating
    if (!isAccelerating) {
      startCoasting();
    }
  };

  // Drag functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.drag-handle')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep panel within viewport bounds
    const panelWidth = panelRef.current?.offsetWidth || 320;
    const panelHeight = panelRef.current?.offsetHeight || 600;
    
    const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - panelWidth));
    const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - panelHeight));
    
    setPosition({ x: constrainedX, y: constrainedY });
  };

  // Cleanup intervals and drag events
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      stopAccelerate();
      stopBrake();
      stopShooting();
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      if (accelerateIntervalRef.current) clearInterval(accelerateIntervalRef.current);
      if (brakeIntervalRef.current) clearInterval(brakeIntervalRef.current);
      if (coastIntervalRef.current) clearInterval(coastIntervalRef.current);
      if (shootIntervalRef.current) clearInterval(shootIntervalRef.current);
    };
  }, [isDragging, dragStart, position]);

  // Initialize coasting when component mounts
  useEffect(() => {
    startCoasting();
    return () => {
      stopCoasting();
    };
  }, []);

  // Stop shooting when ammo reaches 0
  useEffect(() => {
    if (currentAmmo === 0 && isShooting) {
      stopShooting();
    }
  }, [currentAmmo, isShooting]);

  const presets = [
    { name: 'Healthy', key: 'healthy' },
    { name: 'Critical', key: 'critical' },
    { name: 'Stressed', key: 'stressed' },
    { name: 'No Oxygen', key: 'no-oxygen' },
    { name: 'Multiple Critical', key: 'multiple-critical' }
  ];

  return (
    <div 
      ref={panelRef}
      className={`fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 w-80 z-50 max-h-screen overflow-y-auto ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        userSelect: 'none'
      }}
    >
      <div 
        className="drag-handle flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-white font-bold flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          HUD Control Panel
        </h3>
        <Move className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={onHealingToggle}
          className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isHealing
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Heart className="w-4 h-4 mr-1" />
          {isHealing ? 'Stop Healing' : 'Start Healing'}
        </button>

        <button
          onClick={onRepairingToggle}
          className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isRepairing
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Shield className="w-4 h-4 mr-1" />
          {isRepairing ? 'Stop Repair' : 'Start Repair'}
        </button>
      </div>

      {/* Voice Simulation Button */}
      <div className="mb-4">
        <button
          onMouseDown={() => !isSpeaking && onSpeakingToggle()}
          onMouseUp={() => isSpeaking && onSpeakingToggle()}
          onMouseLeave={() => isSpeaking && onSpeakingToggle()}
          className={`w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isSpeaking
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🎤 {isSpeaking ? 'Speaking...' : 'Hold to Speak'}
        </button>
      </div>

      {/* Radio Toggle Button */}
      <div className="mb-4">
        <button
          onClick={onRadioToggle}
          className={`w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isRadioOn
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📻 Radio {isRadioOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Voice Range Controls */}
      <div className="mb-4">
        <h4 className="text-gray-300 text-sm font-medium mb-2">Voice Range</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onVoiceRangeToggle('whisper')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeVoiceRanges.includes('whisper')
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Whisper
          </button>
          <button
            onClick={() => onVoiceRangeToggle('normal')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeVoiceRanges.includes('normal')
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => onVoiceRangeToggle('shout')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeVoiceRanges.includes('shout')
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Shout
          </button>
        </div>
      </div>

      {/* Ammo Controls */}
      <div className="mb-4">
        <h4 className="text-gray-300 text-sm font-medium mb-2">Ammo Control</h4>
        <div className="mb-2">
          <div className="flex justify-between text-gray-300 text-sm mb-1">
            <span>Current: {currentAmmo}</span>
            <span>Reserve: {reserveAmmo}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onMouseDown={startShooting}
            onMouseUp={stopShooting}
            onMouseLeave={stopShooting}
            disabled={currentAmmo === 0}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentAmmo === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : isShooting
                ? 'bg-red-700 text-white shadow-lg'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            🔫 {isShooting ? 'Shooting...' : 'Hold to Shoot'}
          </button>
          <button
            onClick={onReload}
            disabled={reserveAmmo === 0 || currentAmmo === 30}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              reserveAmmo === 0 || currentAmmo === 30
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            🔄 Reload
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mb-4">
        <h4 className="text-gray-300 text-sm font-medium mb-2">Quick Presets</h4>
        <div className="grid grid-cols-2 gap-1">
          {presets.map((preset) => (
            <button
              key={preset.key}
              onClick={() => onPresetLoad(preset.key)}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Individual Stat Controls */}
      <div className="space-y-3">
        {/* Health */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Health: {Math.round(stats.health)}/{stats.maxHealth}
          </label>
          <input
            type="range"
            min="0"
            max={stats.maxHealth}
            value={stats.health}
            onChange={(e) => handleStatChange('health', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-red"
          />
        </div>

        {/* Armor */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Armor: {Math.round(stats.armor)}/{stats.maxArmor}
          </label>
          <input
            type="range"
            min="0"
            max={stats.maxArmor}
            value={stats.armor}
            onChange={(e) => handleStatChange('armor', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-cyan"
          />
        </div>

        {/* Hunger */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Hunger: {Math.round(stats.hunger)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={stats.hunger}
            onChange={(e) => handleStatChange('hunger', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-green"
          />
        </div>

        {/* Thirst */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Thirst: {Math.round(stats.thirst)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={stats.thirst}
            onChange={(e) => handleStatChange('thirst', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
          />
        </div>

        {/* Stress */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Stress: {Math.round(stats.stress)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={stats.stress}
            onChange={(e) => handleStatChange('stress', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-purple"
          />
        </div>

        {/* Oxygen */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Oxygen: {Math.round(stats.oxygen)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={stats.oxygen}
            onChange={(e) => handleStatChange('oxygen', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-green"
          />
        </div>
      </div>

      {/* Vehicle Controls Section */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-gray-300 text-sm font-medium mb-4 flex items-center">
          <Gauge className="w-4 h-4 mr-2" />
          Vehicle Controls
        </h4>

        {/* Speed Controls */}
        <div className="mb-4">
          <label className="text-gray-300 text-sm font-medium mb-2 block">
            Speed: {Math.round(stats.speed)} MPH
          </label>
          <div className="flex space-x-2 mb-2">
            <button
              onMouseDown={handleAccelerate}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors flex items-center justify-center"
            >
              <Car className="w-4 h-4 mr-1" />
              Accelerate
            </button>
            <button
              onMouseDown={handleBrake}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors"
            >
              🛑 Brake
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={stats.speed}
            onChange={(e) => handleStatChange('speed', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
          />
        </div>

        {/* RPM Control */}
        <div className="mb-3">
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            RPM: {(stats.rpm * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={stats.rpm}
            onChange={(e) => handleStatChange('rpm', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-red"
          />
        </div>

        {/* Fuel */}
        <div className="mb-3">
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Fuel: {Math.round(stats.fuel)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={stats.fuel}
            onChange={(e) => handleStatChange('fuel', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-yellow"
          />
        </div>

        {/* Engine Health */}
        <div className="mb-3">
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Engine: {Math.round(stats.engine)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={stats.engine}
            onChange={(e) => handleStatChange('engine', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-orange"
          />
        </div>

        {/* Seatbelt Toggle */}
        <div className="mb-3">
          <button
            onClick={() => handleStatChange('seatbelt', stats.seatbelt ? 0 : 1)}
            className={`w-full py-2 px-3 rounded font-medium text-sm transition-colors ${
              stats.seatbelt 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {stats.seatbelt ? '✅ Seatbelt ON' : '❌ Seatbelt OFF'}
          </button>
        </div>

        {/* Vehicle Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onStatsChange({
                ...stats,
                speed: 0,
                fuel: 100,
                engine: 100,
                seatbelt: false,
                rpm: 0.3
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-2 rounded text-xs transition-colors"
          >
            Reset Vehicle
          </button>
          <button
            onClick={() => {
              onStatsChange({
                ...stats,
                speed: Math.random() * 200,
                fuel: Math.random() * 100,
                engine: Math.random() * 100,
                seatbelt: Math.random() > 0.5,
                rpm: Math.random()
              });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-2 rounded text-xs transition-colors"
          >
            Random Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};