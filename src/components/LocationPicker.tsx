import React, { useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import type { SavedLocation } from '../types';

interface LocationPickerProps {
  currentLocation: SavedLocation;
  savedLocations: SavedLocation[];
  onLocationChange: (location: SavedLocation) => void;
  onLocationSave: (location: SavedLocation) => void;
  onLocationDelete: (id: string) => void;
}

export default function LocationPicker({
  currentLocation,
  savedLocations,
  onLocationChange,
  onLocationSave,
  onLocationDelete
}: LocationPickerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    lat: '',
    lng: ''
  });

  const handleSaveNewLocation = () => {
    if (!newLocation.name || !newLocation.lat || !newLocation.lng) return;
    
    const location: SavedLocation = {
      id: crypto.randomUUID(),
      name: newLocation.name,
      lat: parseFloat(newLocation.lat),
      lng: parseFloat(newLocation.lng)
    };
    
    onLocationSave(location);
    setIsAdding(false);
    setNewLocation({ name: '', lat: '', lng: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <span className="font-medium">Location</span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <select
        value={currentLocation.id}
        onChange={(e) => {
          const location = savedLocations.find(loc => loc.id === e.target.value);
          if (location) onLocationChange(location);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {savedLocations.map(location => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>

      {isAdding && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Add New Location</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Location Name"
              value={newLocation.name}
              onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={newLocation.lat}
                onChange={(e) => setNewLocation(prev => ({ ...prev, lat: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={newLocation.lng}
                onChange={(e) => setNewLocation(prev => ({ ...prev, lng: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleSaveNewLocation}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              Save Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
}