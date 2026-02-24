import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import './GPSDistance.css';

interface GPSDistanceData {
  distance: number;
  unit: string;
  hasWaypoint: boolean;
  hasArmor?: boolean;
}

interface GPSDistanceProps {
  visible?: boolean;
}

export const GPSDistance: React.FC<GPSDistanceProps> = ({ visible = true }) => {
  const [gpsData, setGpsData] = useState<GPSDistanceData>({
    distance: 0,
    unit: 'mi',
    hasWaypoint: false,
    hasArmor: false
  });

  useEffect(() => {
    const handleGPSUpdate = (event: MessageEvent) => {
      if (event.data.action === 'updateGPSDistance') {
        setGpsData(event.data.data);
      }
    };

    window.addEventListener('message', handleGPSUpdate);
    return () => window.removeEventListener('message', handleGPSUpdate);
  }, []);

  if (!visible || !gpsData.hasWaypoint) return null;

  return (
    <div className={`gps-distance-wrapper ${gpsData.hasArmor ? 'armor-equipped' : ''}`}>
      <div className="gps-distance-key-wrapper">
        <Navigation className="gps-distance-icon" size={16} />
        {gpsData.distance.toFixed(1)} {gpsData.unit}
      </div>
    </div>
  );
}; 