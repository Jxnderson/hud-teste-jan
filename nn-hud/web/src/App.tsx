import React, { useState, useEffect } from 'react';
import { GameHUD } from './components/HUD/GameHUD';
import { PlayerStats } from './components/HUD/types';

interface NUIMessage {
  action: string;
  data?: unknown;
}

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState({
    disableStress: false,
    disableStamina: false,
    disableOxygen: false,
    hudSettings: {
      showHealth: true,
      showArmor: true,
      showHunger: true,
      showThirst: true,
      showStress: true,
      showOxygen: true,
      showVoice: true,
      showSpeed: true,
      showFuel: true,
      showEngine: true,
      showSeatbelt: true,
      showCruise: true,
      animateStatusBars: true,
    }
  });
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    armor: 0,
    maxArmor: 100,
    hunger: 100,
    thirst: 100,
    stress: 0,
    oxygen: 100,
    stamina: 100,
    speed: 0,
    fuel: 100,
    engine: 100,
    seatbelt: false,
    rpm: 0
  });

  const [playerData, setPlayerData] = useState({
    show: false,
    talking: false,
    talkingOnRadio: false,
    onPhone: false,
    armed: false,
    parachute: -1,
    playerDead: false,
    voice: 2, // Default to normal voice range
    currentAmmo: 0,
    reserveAmmo: 0,
    inLastStand: false,
    hasRadio: false
  });

  const [vehicleData, setVehicleData] = useState({
    show: false,
    seatbelt: false,
    cruise: false,
    nos: 0,
    gear: 0,
    gearProgress: 0,
    speedUnit: "MPH"
  });

  const [accountData, setAccountData] = useState({
    type: '',
    amount: 0,
    visible: false
  });

  // Add theme colors state
  const [themeColors, setThemeColors] = useState<Record<string, string>>({});

  // Comprehensive theme preservation function to prevent color resets
  const preserveThemeColors = () => {
    const root = document.documentElement;
    const themeKeys = ['health', 'armor', 'hunger', 'thirst', 'stamina', 'oxygen', 'ammo', 'stress'];
    const currentTheme: Record<string, string> = {};
    
    // Get current theme colors from CSS variables
    themeKeys.forEach(key => {
      const value = root.style.getPropertyValue(`--hud-${key}-color`);
      if (value) {
        currentTheme[key] = value;
      }
    });
    
    // Also check for any other theme colors that might be set from state
    Object.entries(themeColors).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        currentTheme[key] = value;
      }
    });
    
    // Reapply theme with !important priority if we have theme colors
    if (Object.keys(currentTheme).length > 0) {
      Object.entries(currentTheme).forEach(([key, value]) => {
        if (key.startsWith('--hud-')) {
          root.style.setProperty(key, value, 'important');
        } else {
          root.style.setProperty(`--hud-${key}-color`, value, 'important');
        }
      });
      
      // Force multiple DOM reflows to ensure changes stick
      document.documentElement.offsetHeight;
      document.body.offsetHeight;
    }
  };

  // Theme colors are now loaded from database via 'loadThemeColors' message
  // This useEffect is kept for legacy localStorage fallback (optional)
  useEffect(() => {
    // Note: Theme colors are primarily loaded from database now
    // This is only a fallback in case database loading fails
    const loadLocalThemeColors = () => {
      const savedColors = localStorage.getItem('nn-hud-theme-colors');
      if (savedColors) {
        try {
          const colors = JSON.parse(savedColors);
          const root = document.documentElement;
          Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--hud-${key}-color`, value as string);
          });

        } catch (error) {
          console.error('Failed to load fallback theme colors from localStorage:', error);
        }
      }
    };

    // Only load from localStorage if no database theme has been loaded yet
    // We'll set a small delay to let database loading happen first
    const timer = setTimeout(() => {
      loadLocalThemeColors();
    }, 5000); // 5 second delay to let database load first

    return () => clearTimeout(timer);
  }, []);



  // NUI Message Listener
  useEffect(() => {
    const messageHandler = (event: MessageEvent<NUIMessage>) => {
      const { action, data } = event.data;

      switch (action) {
        case 'setVisible':
          setIsVisible(data as boolean);
          break;

        case 'hudInitialize':
          setIsVisible(true);
          if (data && typeof data === 'object') {
            const initData = data as Record<string, unknown>;
            if (initData.config && typeof initData.config === 'object') {
              setConfig(initData.config as typeof config);
            }
          }
          break;

        case 'updatePlayerHud':
          if (data && typeof data === 'object') {
            const hudData = data as Record<string, unknown>;
            const currentAmmo = (hudData.currentAmmo as number) ?? 0;
            const reserveAmmo = (hudData.reserveAmmo as number) ?? 0;
            
            setPlayerData({
              show: (hudData.show as boolean) || false,
              talking: (hudData.talking as boolean) || false,
              talkingOnRadio: (hudData.talkingOnRadio as boolean) || false,
              onPhone: (hudData.onPhone as boolean) || false,
              armed: (hudData.armed as boolean) || false,
              parachute: (hudData.parachute as number) || -1,
              playerDead: (hudData.playerDead as boolean) || false,
              voice: (hudData.voice as number) || 2, // Default to normal voice range
              currentAmmo: currentAmmo,
              reserveAmmo: reserveAmmo,
              inLastStand: (hudData.inLastStand as boolean) || false,
              hasRadio: (hudData.hasRadio as boolean) || false
            });
            
        setStats(prev => ({
          ...prev,
              health: typeof hudData.health === 'number' ? hudData.health : prev.health,
              armor: typeof hudData.armor === 'number' ? hudData.armor : prev.armor,
              hunger: typeof hudData.hunger === 'number' ? hudData.hunger : prev.hunger,
              thirst: typeof hudData.thirst === 'number' ? hudData.thirst : prev.thirst,
              stress: typeof hudData.stress === 'number' ? hudData.stress : prev.stress,
              oxygen: typeof hudData.oxygen === 'number' ? hudData.oxygen : prev.oxygen,
              stamina: typeof hudData.stamina === 'number' ? hudData.stamina : prev.stamina
            }));
            
            // COMPREHENSIVE THEME PRESERVATION for ALL player HUD updates
            // This prevents theme reset on voice changes, health/armor changes, radio use, etc.
            setTimeout(() => {
              preserveThemeColors();
            }, 50);
          }
        break;

        case 'updateVehicleHud':
          if (data && typeof data === 'object') {
            const vehData = data as Record<string, unknown>;
            const isShowing = (vehData.show as boolean) || false;
            
            setVehicleData({
              show: isShowing,
              seatbelt: (vehData.seatbelt as boolean) || false,
              cruise: (vehData.cruise as boolean) || false,
              nos: (vehData.nos as number) || 0,
              gear: (vehData.gear as number) || 0,
              gearProgress: (vehData.gearProgress as number) || 0,
              speedUnit: (vehData.speedUnit as string) || "MPH"
            });
            
        setStats(prev => ({
          ...prev,
              speed: typeof vehData.speed === 'number' ? vehData.speed : prev.speed,
              fuel: typeof vehData.fuel === 'number' ? vehData.fuel : prev.fuel,
              engine: typeof vehData.engine === 'number' ? vehData.engine : prev.engine
            }));
            
            // Force theme preservation when vehicle HUD state changes (prevents color reset)
            if (vehData.show !== undefined) {
              setTimeout(() => {
                preserveThemeColors();
              }, 50);
            }
          }
          break;

        case 'showAccount':
          if (data && typeof data === 'object') {
            const accData = data as Record<string, unknown>;
            setAccountData({
              type: (accData.type as string) || '',
              amount: (accData.amount as number) || 0,
              visible: true
            });
            
            // Hide account display after 3 seconds
            setTimeout(() => {
              setAccountData(prev => ({ ...prev, visible: false }));
            }, 3000);
          }
          break;

        case 'seatbeltToggle':
          if (data && typeof data === 'object') {
            const toggleData = data as Record<string, unknown>;
            setStats(prev => ({ ...prev, seatbelt: (toggleData.enabled as boolean) || false }));
          }
          break;

        case 'cruiseToggle':
          if (data && typeof data === 'object') {
            const toggleData = data as Record<string, unknown>;
            setVehicleData(prev => ({ ...prev, cruise: (toggleData.enabled as boolean) || false }));
          }
          break;

        case 'engineToggle':
          // Handle engine on/off visual feedback
        break;

        case 'fuelWarning':
          // Warning UI removed - no action needed
        break;

        case 'loadThemeColors':
          // Load theme colors from database
          if (data && typeof data === 'object') {
            const colors = data as Record<string, string>;
            
            // Store theme colors in state for preservation function
            setThemeColors(colors);
            
            const root = document.documentElement;
            Object.entries(colors).forEach(([key, value]) => {
              root.style.setProperty(`--hud-${key}-color`, value, 'important');
            });
            // Force repaint
            document.body.offsetHeight;
            // Force components to re-render
            setStats(prev => ({ ...prev }));
          }
        break;

        case 'forceApplyThemeColors':
          // Force apply theme colors with override
          if (data && typeof data === 'object') {
            const themeData = data as { colors: Record<string, string>; overrideCSS?: boolean; priority?: string };
            if (themeData.colors) {
              // Store theme colors in state for preservation function
              setThemeColors(themeData.colors);
              
              const root = document.documentElement;
              Object.entries(themeData.colors).forEach(([key, value]) => {
                root.style.setProperty(`--hud-${key}-color`, value, themeData.priority || 'important');
              });
              // Force immediate repaint
              document.body.offsetHeight;
              // Force all components to re-render
              setStats(prev => ({ ...prev }));
              setPlayerData(prev => ({ ...prev }));
              setVehicleData(prev => ({ ...prev }));
            }
          }
        break;

        case 'forceThemeColorsByDOM':
          // Alternative DOM-based theme application
          if (data && typeof data === 'object') {
            const colors = data as Record<string, string>;
            const root = document.documentElement;
            // Remove existing theme properties first
            Object.keys(colors).forEach(key => {
              root.style.removeProperty(`--hud-${key}-color`);
            });
            // Re-apply with force
            requestAnimationFrame(() => {
              Object.entries(colors).forEach(([key, value]) => {
                root.style.setProperty(`--hud-${key}-color`, value, 'important');
              });
              document.body.offsetHeight;
              // Trigger re-renders
              setStats(prev => ({ ...prev }));
            });
          }
        break;

        case 'forceHudRefresh':
          // Force HUD component refresh
          setStats(prev => ({ ...prev }));
          setPlayerData(prev => ({ ...prev }));
          setVehicleData(prev => ({ ...prev }));
          // Force DOM reflow
          document.body.offsetHeight;
        break;

        case 'refreshAllComponents':
          // Refresh all HUD components
          setStats(prev => ({ ...prev }));
          setPlayerData(prev => ({ ...prev }));
          setVehicleData(prev => ({ ...prev }));
          setAccountData(prev => ({ ...prev }));
          // Force style recalculation
          requestAnimationFrame(() => {
            document.body.offsetHeight;
          });
        break;

        default:
        break;
    }
  };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  // Low health warning removed - no longer needed

  // ESC key handling moved to GameHUD component to handle theme dashboard properly

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GameHUD
        stats={stats}
          playerData={playerData} 
          vehicleData={vehicleData}
          accountData={accountData}
          config={config}
        />
    </div>
  );
}

export default App;