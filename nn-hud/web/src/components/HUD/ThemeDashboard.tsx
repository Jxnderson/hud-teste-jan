import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Palette, X, RotateCcw, Save, Heart, Shield, UtensilsCrossed, Droplets, Zap, Wind, Target, Brain } from 'lucide-react';
import './ThemeDashboard.css';

interface ThemeColors {
  health: string;
  armor: string;
  hunger: string;
  thirst: string;
  stamina: string;
  oxygen: string;
  ammo: string;
  stress: string;
}

interface ThemeDashboardProps {
  visible: boolean;
  onClose: () => void;
}

const defaultColors: ThemeColors = {
  health: '#25d489',    // Green
  armor: '#7ec8f7',     // Blue
  hunger: '#f59e0b',    // Amber
  thirst: '#06b6d4',    // Cyan
  stamina: '#10b981',   // Emerald
  oxygen: '#8b5cf6',    // Violet
  ammo: '#f97316',      // Orange
  stress: '#8b5cf6'     // Violet
};

// Apply color variables to CSS
const applyCSSVariables = (colors: ThemeColors) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--hud-${key}-color`, value);
  });
};

export const ThemeDashboard: React.FC<ThemeDashboardProps> = ({ visible, onClose }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [isLoadingFromDatabase, setIsLoadingFromDatabase] = useState(true);
  const [colorsLoadedFromDatabase, setColorsLoadedFromDatabase] = useState(false);

  // Load colors directly from database when component mounts
  useEffect(() => {
    const loadColorsFromDatabase = async () => {
      try {
        // Request fresh theme colors from server/database
        const response = await fetch('https://nn-hud/getThemeColors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        
        if (response.ok) {
          const databaseColors = await response.json();
          if (databaseColors && typeof databaseColors === 'object' && Object.keys(databaseColors).length > 0) {

            
            // Validate that we have actual color values (hex codes)
            const validColors: Partial<ThemeColors> = {};
            Object.entries(databaseColors).forEach(([key, value]) => {
              if (typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)) {
                validColors[key as keyof ThemeColors] = value;
              }
            });
            
            if (Object.keys(validColors).length > 0) {
              const mergedColors = { ...defaultColors, ...validColors };
              setColors(mergedColors);
              applyCSSVariables(mergedColors);
              setColorsLoadedFromDatabase(true);

            } else {

              setColors(defaultColors);
              applyCSSVariables(defaultColors);
              setColorsLoadedFromDatabase(false);
            }
          } else {

            setColors(defaultColors);
            applyCSSVariables(defaultColors);
          }
        } else {
          throw new Error('Failed to fetch theme colors from server');
        }
      } catch (error) {

        
        // Fallback: Get current CSS variable values that may have been set by database loading
        const root = document.documentElement;
        const currentColors: Partial<ThemeColors> = {};
        
        Object.keys(defaultColors).forEach(key => {
          const currentValue = root.style.getPropertyValue(`--hud-${key}-color`);
          if (currentValue) {
            currentColors[key as keyof ThemeColors] = currentValue;
          }
        });
        
        // If we have current values from CSS variables, use them; otherwise use defaults
        const finalColors = Object.keys(currentColors).length > 0 
          ? { ...defaultColors, ...currentColors }
          : defaultColors;
        
        setColors(finalColors);
        applyCSSVariables(finalColors);
      } finally {
        setIsLoadingFromDatabase(false);
      }
    };

    if (visible) {
      loadColorsFromDatabase();
    }
  }, [visible]);

  // Listen for theme changes from external sources (like App.tsx loadThemeColors)
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'object') {

        const externalColors = event.detail as Partial<ThemeColors>;
        const mergedColors = { ...defaultColors, ...externalColors };
        setColors(mergedColors);
      }
    };

    const handleMessageThemeLoad = (event: MessageEvent) => {
      if (event.data.action === 'loadThemeColors' && event.data.data) {

        const messageColors = event.data.data as Partial<ThemeColors>;
        const mergedColors = { ...defaultColors, ...messageColors };
        setColors(mergedColors);
      }
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    window.addEventListener('message', handleMessageThemeLoad);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
      window.removeEventListener('message', handleMessageThemeLoad);
    };
  }, []);

  // Simple color change handler - no real-time application
  const handleColorChange = useCallback((type: keyof ThemeColors, color: string) => {
    setColors(prev => ({
      ...prev,
      [type]: color
    }));
  }, []);

  // Save handler - this is where colors get applied
  const handleSave = useCallback(() => {

    
    // Apply the colors to CSS variables with !important
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--hud-${key}-color`, value, 'important');

    });
    
    // Force browser to recalculate styles
    document.body.offsetHeight;
    
    // Dispatch a custom event to notify components to re-render
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: colors }));
    
    // Send to client for database persistence (localStorage no longer used)
    fetch('https://nn-hud/saveThemeColors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(colors)
    }).catch(() => {
      // Silent error handling
    });
    
    onClose();
  }, [colors, onClose]);

  // Reset handler - apply default colors and save to database
  const handleReset = useCallback(() => {
    setColors(defaultColors);
    applyCSSVariables(defaultColors);
    
    // Save default colors to database
    fetch('https://nn-hud/saveThemeColors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(defaultColors)
    }).catch(() => {
      // Silent error handling
    });
  }, []);

  // Memoize color items to prevent recreation on every render
  const colorItems = useMemo(() => [
    { key: 'health' as keyof ThemeColors, label: 'Health', icon: Heart },
    { key: 'armor' as keyof ThemeColors, label: 'Armor', icon: Shield },
    { key: 'hunger' as keyof ThemeColors, label: 'Hunger', icon: UtensilsCrossed },
    { key: 'thirst' as keyof ThemeColors, label: 'Thirst', icon: Droplets },
    { key: 'stamina' as keyof ThemeColors, label: 'Stamina', icon: Zap },
    { key: 'oxygen' as keyof ThemeColors, label: 'Oxygen', icon: Wind },
    { key: 'stress' as keyof ThemeColors, label: 'Stress', icon: Brain },
    { key: 'ammo' as keyof ThemeColors, label: 'Ammo', icon: Target }
  ], []);

  // Early return if not visible to prevent unnecessary rendering
  if (!visible) return null;

  return (
    <div className="theme-dashboard-overlay">
      <div className="theme-dashboard">
        {/* Header */}
        <div className="theme-header">
          <div className="theme-title">
            <Palette className="theme-icon" size={20} />
            <span>HUD Theme Customizer</span>
          </div>
          <button className="theme-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Color Pickers Grid */}
        <div className="theme-content">
          <div className="color-grid">
            {colorItems.map(({ key, label, icon }) => (
              <div key={key} className="color-item">
                <div className="color-label">
                  <span className="color-icon">
                    {typeof icon === 'string' ? icon : React.createElement(icon, { size: 16 })}
                  </span>
                  <span className="color-name">{label}</span>
                </div>
                <div className="color-picker-container">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="color-picker"
                  />
                  <div 
                    className="color-preview"
                    style={{ 
                      backgroundColor: colors[key],
                      border: `2px solid ${colors[key]}`,
                      boxShadow: `0 0 8px ${colors[key]}30`,
                      opacity: isLoadingFromDatabase ? 0.5 : 1,
                      transition: 'all 0.3s ease'
                    }}
                    title={`${label}: ${colors[key]}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Preview Section */}
          {/* <div className="preview-section">
            <h3 className="preview-title">
              {isLoadingFromDatabase ? 'Loading Colors from Database...' : 
               colorsLoadedFromDatabase ? 'Preview (Colors Loaded from Database)' : 'Preview (Using Default Colors)'}
            </h3>
            <div className="preview-bars">
              {colorItems.map(({ key, label }) => (
                <div key={key} className="preview-bar-container">
                  <span className="preview-bar-label">{label}</span>
                  <div className="preview-bar-track">
                    <div 
                      className="preview-bar-fill"
                      style={{ 
                        backgroundColor: colors[key],
                        width: '75%',
                        boxShadow: `0 0 10px ${colors[key]}40`,
                        opacity: isLoadingFromDatabase ? 0.5 : 1
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="theme-actions">
          <button className="theme-btn theme-btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset to Default
          </button>
          <button className="theme-btn theme-btn-primary" onClick={handleSave}>
            <Save size={16} />
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
}; 