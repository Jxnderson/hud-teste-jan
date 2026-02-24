import React, { useState, useEffect } from 'react';
import { Compass as CompassIcon, Map, MapPin } from 'lucide-react';
import './Compass.css';

interface CompassData {
  direction: string;
  roads: string;
  zone: string;
}

interface CompassProps {
  visible?: boolean;
}

export const Compass: React.FC<CompassProps> = ({ visible = true }) => {
  const [compassData, setCompassData] = useState<CompassData>({
    direction: 'N',
    roads: 'Strawberry Ave x Olympic Fwy',
    zone: 'Strawberry'
  });

  useEffect(() => {
    const handleCompassUpdate = (event: MessageEvent) => {
      if (event.data.action === 'updateCompass') {
        setCompassData(event.data.data);
      }
    };

    window.addEventListener('message', handleCompassUpdate);
    return () => window.removeEventListener('message', handleCompassUpdate);
  }, []);

  if (!visible) return null;

  return (
    <div className="compass-wrapper">
      <div className="compass-key-wrapper">
        <CompassIcon className="compass-icon" size={16} /> {compassData.direction}
      </div>
      <div className="compass-key-wrapper">
        <MapPin className="compass-icon" size={16} /> {compassData.roads}
      </div>
      <div className="compass-key-wrapper">
        <Map className="compass-icon" size={16} /> {compassData.zone}
      </div>
    </div>
  );
}; 