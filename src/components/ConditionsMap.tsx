import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface ConditionsMapProps {
  lat: number;
  lng: number;
  windDirection: number;
  swellDirection: number;
}

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [];

const ConditionsMap: React.FC<ConditionsMapProps> = ({ lat, lng, windDirection, swellDirection }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries
  });

  // Add debug logging
  console.log('Wind direction:', windDirection);
  console.log('Swell direction:', swellDirection);

  const mapOptions = {
    disableDefaultUI: true,
    mapTypeId: 'satellite',
    tilt: 0,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  // Create arrow icons
  const createArrowIcon = (color: string, rotation: number, isWind: boolean = true) => ({
    path: isWind ? google.maps.SymbolPath.FORWARD_CLOSED_ARROW : google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: isWind ? 1.0 : 0.7,
    strokeWeight: isWind ? 4 : 2,
    strokeColor: color,
    rotation: rotation - 180,
    scale: isWind ? 16 : 30,
  });

  // Create swell arrow icon
  const createSwellArrow = (rotation: number) => ({
    path: 'M -1,0 A 1,1 0 0 1 1,0 A 1,1 0 0 1 -1,0 M 0,-0.5 L 0.5,0 L 0,0.5 L -0.5,0 Z',
    fillColor: 'white',
    fillOpacity: 1.0,
    strokeWeight: 2,
    strokeColor: 'white',
    rotation: rotation - 180,
    scale: 20,
  });

  // Calculate marker positions
  const windOffset = 0.0015;
  const windPosition = { lat: lat + windOffset, lng: lng + windOffset };

  if (loadError) {
    return <div className="w-full h-48 rounded-xl bg-red-50 flex items-center justify-center text-red-500">Error loading map</div>;
  }

  if (!isLoaded) {
    return <div className="w-full h-48 rounded-xl bg-gray-100 animate-pulse" />;
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-48 rounded-xl overflow-hidden"
      center={{ lat, lng }}
      zoom={14}
      options={mapOptions}
    >
      {/* Wind direction marker */}
      <Marker
        position={windPosition}
        icon={createArrowIcon('#3b82f6', windDirection)}
        title="Wind Direction"
      />

      {/* Swell direction marker */}
      <Marker
        position={{ lat, lng }}
        icon={createSwellArrow(swellDirection)}
        title="Swell Direction"
      />
    </GoogleMap>
  );
};

export default ConditionsMap; 