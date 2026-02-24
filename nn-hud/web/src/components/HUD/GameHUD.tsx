import React, { useState, useEffect } from 'react';
import { HealthBar } from './HealthBar';
import { ArmorBar } from './ArmorBar';
import { HungerBar } from './HungerBar';
import { ThirstBar } from './ThirstBar';
import { StressBar } from './StressBar';
import { OxygenBar } from './OxygenBar';
import { StaminaBar } from './StaminaBar';
import { EffectsOverlay } from './EffectsOverlay';
import { PlayerStats, PlayerData, VehicleData, AccountData } from './types';

import Speedometer from './Speedometer';
import StatusBar from './StatusBar';
import AmmoDisplay from './AmmoDisplay';
import VoiceSystem from './VoiceSystem';
import { Compass } from './Compass';
import { GPSDistance } from './GPSDistance';
import { ThemeDashboard } from './ThemeDashboard';

import './GameHUD.css';

interface GameHUDProps {
  stats: PlayerStats;
  playerData?: PlayerData;
  vehicleData?: VehicleData;
  accountData?: AccountData;
  config?: {
    disableStress: boolean;
    disableStamina: boolean;
    disableOxygen: boolean;
    hudSettings: {
      showHealth: boolean;
      showArmor: boolean;
      showHunger: boolean;
      showThirst: boolean;
      showStress: boolean;
      showOxygen: boolean;
      showVoice: boolean;
      showSpeed: boolean;
      showFuel: boolean;
      showEngine: boolean;
      showSeatbelt: boolean;
      showCruise: boolean;
      animateStatusBars: boolean;
    };
  };
  // Legacy props for development mode
  isHealing?: boolean;
  isRepairing?: boolean;
  isSpeaking?: boolean;
  currentAmmo?: number;
  reserveAmmo?: number;
  isRadioOn?: boolean;
}


export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  playerData,
  vehicleData,
  accountData,
  config,
  isHealing = false,
  isRepairing = false,
  isSpeaking = false,
  isRadioOn = false
  
}) => {
  const [isVisible] = useState(true)
  const [speedometerVisible, setSpeedometerVisible] = useState(false)
  const [animationClass, setAnimationClass] = useState('')
  const [themeDashboardVisible, setThemeDashboardVisible] = useState(false)
  const [themeVersion, setThemeVersion] = useState(0) // Force re-render when theme changes
  

  
  // Use stats from control panel instead of useVehicleEvents
  const { speed, fuel, engine, seatbelt } = stats
  
  // Get gear progress from vehicleData for progress bar control
  const gearProgress = vehicleData?.gearProgress || 0
  
  // Use gear progress to control speedometer progress bar
  // Progress bar shows gear progress (0-100%) instead of speed
  // But display still shows actual speed in MPH

  // Determine if player is in vehicle and armed
  const isInVehicle = vehicleData?.show || false;
  const isArmed = playerData?.armed || false;


  // Handle speedometer slide-up animation
  useEffect(() => {
    if (isInVehicle && !speedometerVisible) {
      // Show speedometer with animation
      setSpeedometerVisible(true);
      setAnimationClass('animate-slide-up');
      
      // Clear animation class after animation completes
      setTimeout(() => {
        setAnimationClass('slide-up-visible');
      }, 600);
    } else if (!isInVehicle && speedometerVisible) {
      // Hide speedometer immediately (no exit animation requested)
      setSpeedometerVisible(false);
      setAnimationClass('');
    }
  }, [isInVehicle, speedometerVisible]);

  // Note: Responsive scaling is now handled by CSS media queries instead of JavaScript

  // Handle theme dashboard toggle
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'toggleThemeDashboard') {
        setThemeDashboardVisible(prev => !prev);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle theme changes to force re-render
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeVersion(prev => prev + 1);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Handle NUI focus when theme dashboard opens/closes
  useEffect(() => {
    if (themeDashboardVisible) {
      // Enable cursor when dashboard opens
      fetch('https://nn-hud/setNuiFocus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasFocus: true,
          hasCursor: true
        })
      }).catch(() => {
        // Ignore fetch errors in development
      });
    } else {
      // Disable cursor when dashboard closes
      fetch('https://nn-hud/setNuiFocus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasFocus: false,
          hasCursor: false
        })
      }).catch(() => {
        // Ignore fetch errors in development
      });
    }
  }, [themeDashboardVisible]);

  const [showStressBar, setShowStressBar] = useState(false)
  useEffect(() => {
    if (stats.stress > 0) {
      setShowStressBar(true)
      return
    }
    const t = setTimeout(() => setShowStressBar(false), 400)
    return () => clearTimeout(t)
  }, [stats.stress])

  // Handle ESC key - close theme dashboard first, then hide HUD
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (themeDashboardVisible) {
          // Close theme dashboard if it's open
          setThemeDashboardVisible(false);
        } else {
          // Hide entire HUD if theme dashboard is not open
          fetch('https://nn-hud/hideFrame', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
          }).catch(() => {
            // Ignore fetch errors in development
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [themeDashboardVisible]);



  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* HUD Container */}
      <div key={themeVersion} className="player-status-container">
        {/* HUD Layout */}
        <div className="player-status-layout">
          {/* Health and Armor Section */}
          <div className="health-armor-section">
            {/* Armor Bar - Show if enabled AND (player has armor OR theme dashboard is open) */}
            {(config?.hudSettings?.showArmor !== false) && (stats.armor > 0 || themeDashboardVisible) && (
            <ArmorBar
                armor={themeDashboardVisible ? Math.max(stats.armor, 75) : stats.armor}
              maxArmor={stats.maxArmor}
              isRepairing={isRepairing}
              className="armor-bar-item"
            />
            )}
            {/* Health Bar - Show if enabled OR theme dashboard is open */}
            {(config?.hudSettings?.showHealth !== false || themeDashboardVisible) && (
            <HealthBar
              health={themeDashboardVisible ? Math.max(stats.health, 80) : stats.health}
              maxHealth={stats.maxHealth}
              isHealing={isHealing}
              inLastStand={playerData?.inLastStand || false}
              className="health-bar-item"
            />
            )}
          </div>

          {/* Status Bars Section */}
          <div className="status-bars-section">
            {/* Hunger Bar - Show when < 100% OR theme dashboard is open */}
            {(config?.hudSettings?.showHunger !== false) && (stats.hunger < 100 || themeDashboardVisible) && (
            <HungerBar
                value={themeDashboardVisible ? Math.max(stats.hunger, 65) : stats.hunger}
            />
            )}
            {/* Thirst Bar - Show when < 100% OR theme dashboard is open */}
            {(config?.hudSettings?.showThirst !== false) && (stats.thirst < 100 || themeDashboardVisible) && (
            <ThirstBar
                value={themeDashboardVisible ? Math.max(stats.thirst, 70) : stats.thirst}
            />
            )}
            {/* Stress Bar - Hide at 0, but debounce to avoid flicker */}
            {(config?.hudSettings?.showStress !== false) && !config?.disableStress && (showStressBar || themeDashboardVisible) && (
            <StressBar
                value={themeDashboardVisible ? Math.max(stats.stress, 25) : stats.stress}
            />
            )}
            {/* Stamina Bar - Show when stamina enabled and (< 100% OR theme dashboard is open) */}
            {(config?.hudSettings?.showOxygen !== false) && !config?.disableStamina && (stats.stamina < 100 || themeDashboardVisible) && (
              <StaminaBar
                value={themeDashboardVisible ? Math.max(stats.stamina, 85) : stats.stamina}
              />
            )}
            {/* Oxygen Bar - Show when oxygen enabled and (< 100% OR theme dashboard is open) */}
            {(config?.hudSettings?.showOxygen !== false) && !config?.disableOxygen && (stats.oxygen < 100 || themeDashboardVisible) && (
            <OxygenBar
                value={themeDashboardVisible ? Math.max(stats.oxygen, 90) : stats.oxygen}
            />
            )}
          </div>
        </div>
      </div>

      {/* Compass - Show when in vehicle (PR-HUD style) */}
      {speedometerVisible && (
        <div className="absolute top-0 left-0 right-0 z-20">
          <Compass visible={speedometerVisible} />
        </div>
      )}

      {/* GPS Distance - Show above minimap when waypoint is set */}
      <GPSDistance visible={true} />

      {/* HUD Multi-Column Grid Container */}
      {isVisible && (
        <div className={`hud-grid-container ${isVisible ? "visible" : ""}`}>
          
          {/* First Column - Speedometer Container (Always present for grid spacing) */}
          <div className={`speedometer-container ${animationClass}`} style={{ 
            opacity: speedometerVisible ? 1 : 0,
            pointerEvents: speedometerVisible ? 'auto' : 'none'
          }}>
            {speedometerVisible && (
              <>
            {/* Speedometer - Show if speed setting is enabled */}
            {(config?.hudSettings?.showSpeed !== false) && (
            <div className="speedometer-wrapper">
              <Speedometer
                maxLengthDisplay={72}
                rotateDegree={230}
                ringSize={3.5}
                    progressColor={gearProgress < 30 ? "greenyellow" : gearProgress < 60 ? "#ffff00" : gearProgress < 90 ? "#ff8000" : "#FF3838"}
                outlineColor="black"
                outlineColorOpacity={0.6}
                height={90}
                width={90}
                    progressValue={gearProgress}
                text={vehicleData?.speedUnit || "MPH"}
                displayNumber={speed}
                    maxProgressValue={100}
              />
            </div>
            )}

            <div className="stats-wrapper">
              {/* FUEL StatusBar - Show if fuel setting is enabled */}
              {(config?.hudSettings?.showFuel !== false) && (
                <StatusBar label="FUEL" value={fuel} backgroundColor="rgb(255, 185, 34)" />
              )}
              {/* ENG StatusBar - Show if engine setting is enabled */}
              {(config?.hudSettings?.showEngine !== false) && (
                <StatusBar label="ENG" value={engine} backgroundColor="rgb(255, 100, 100)" />
              )}
              {/* BELT StatusBar - Show if seatbelt setting is enabled */}
              {(config?.hudSettings?.showSeatbelt !== false) && (
                <StatusBar label="BELT" value={seatbelt ? 1 : 0} isBoolean={true} />
              )}
            </div>
              </>
            )}
          </div>

          {/* Second Column - Ammo and Voice Systems */}
          <div className="ammo-voice-container">
            
            {/* Ammo Display (When armed OR theme dashboard is open) */}
            {(isArmed || themeDashboardVisible) && (
            <div className="ammo-display-position">
                <AmmoDisplay 
                  currentAmmo={themeDashboardVisible ? Math.max(playerData?.currentAmmo ?? 0, 24) : (playerData?.currentAmmo ?? 0)} 
                  reserveAmmo={themeDashboardVisible ? Math.max(playerData?.reserveAmmo ?? 0, 120) : (playerData?.reserveAmmo ?? 0)} 
                />
            </div>
            )}
            
            {/* Voice System - Show if voice setting is enabled */}
            {(config?.hudSettings?.showVoice !== false) && (
            <div className="voice-system-position">
              <VoiceSystem 
                isSpeaking={playerData?.talking || isSpeaking}
                isRadioActive={playerData?.talkingOnRadio || isRadioOn}
                hasRadio={playerData?.hasRadio ?? false}
                voiceRange={playerData?.voice || 1}
              />
            </div>
            )}
          </div>
        </div>
      )}

      {/* Account Display (When visible) */}
      {accountData?.visible && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg border border-gray-600 shadow-lg">
          <div className="text-lg font-bold">
            {accountData.type.toUpperCase()}: ${accountData.amount.toLocaleString()}
          </div>
        </div>
      )}



      {/* Screen Effects Overlay */}
      <EffectsOverlay stats={stats} />

      {/* Theme Dashboard */}
      <ThemeDashboard 
        visible={themeDashboardVisible}
        onClose={() => setThemeDashboardVisible(false)}
      />

    </div>
  );
};