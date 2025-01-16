import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface ConditionsMapProps {
  lat: number;
  lng: number;
  windDirection: number;
  swellDirection: number;
}

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [];

const ConditionsMap: React.FC<ConditionsMapProps> = ({ lat, lng, windDirection }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries
  });

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

  // Create wind arrow icon
  const createArrowIcon = (color: string, rotation: number) => ({
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    fillColor: color,
    fillOpacity: 1.0,
    strokeWeight: 4,
    strokeColor: color,
    rotation: rotation - 180,
    scale: 16,
  });

  // Calculate marker position
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
    </GoogleMap>
  );
};

export default ConditionsMap; 