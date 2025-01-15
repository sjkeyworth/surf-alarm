import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Bell, Sun, Wind, Waves } from 'lucide-react';
import type { AlarmSettings, WeatherCondition, SurfCondition, SavedLocation } from '../types';
import LocationPicker from './LocationPicker';

// Move audio instance outside component to persist between renders
const alarmSound = new Audio('/mixkit-rooster-crowing-in-the-morning-2462.wav');
alarmSound.loop = true;

export default function AlarmClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings>({
    time: '06:00',
    minTemp: 15,
    maxWindSpeed: 20,
    minWaveHeight: 1,
    enabled: false,
    backupTime: '07:00',
    backupEnabled: false
  });
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [surf, setSurf] = useState<SurfCondition | null>(null);
  
  // Initialize with Macauleys Beach
  const [currentLocation, setCurrentLocation] = useState<SavedLocation>({
    id: 'macauleys',
    name: 'Macauleys Beach',
    lat: -33.7827,
    lng: 151.2865
  });
  
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    {
      id: 'macauleys',
      name: 'Macauleys Beach',
      lat: -33.7827,
      lng: 151.2865
    }
  ]);

  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  const checkAlarm = useCallback(() => {
    const now = new Date();
    const currentTimeString = format(now, 'HH:mm');
    
    // Check if either alarm should trigger
    if (alarmSettings.enabled && currentTimeString === alarmSettings.time) {
      // Check weather conditions for primary alarm
      if (checkConditions()) {
        triggerAlarm('Perfect surf conditions! Time to hit the waves! 🏄‍♂️');
      } else if (alarmSettings.backupEnabled && currentTimeString === alarmSettings.backupTime) {
        // Trigger backup alarm if conditions aren't met
        triggerAlarm('Backup alarm - surf conditions not ideal');
      }
    }
  }, [alarmSettings, weather, surf]);

  const triggerAlarm = (message: string) => {
    setIsAlarmRinging(true);
    alarmSound.play();
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('Surf Alarm', {
        body: message,
        icon: '/icon.png'
      });
    }
  };

  const stopAlarm = () => {
    setIsAlarmRinging(false);
    alarmSound.pause();
    alarmSound.currentTime = 0;
  };

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check alarm every minute
  useEffect(() => {
    const timer = setInterval(checkAlarm, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [checkAlarm]);

  // Add alarm modal/overlay
  const AlarmOverlay = () => isAlarmRinging ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Time to Wake Up! ⏰</h2>
        <p className="text-gray-600 mb-6">
          {checkConditions() 
            ? "Perfect surf conditions! Time to hit the waves! 🏄‍♂️"
            : "Backup alarm - surf conditions not ideal"}
        </p>
        <button
          onClick={stopAlarm}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
        >
          Stop Alarm
        </button>
      </div>
    </div>
  ) : null;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load saved locations from localStorage
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      const locations = JSON.parse(saved);
      setSavedLocations(locations);
      
      // Set current location to the first saved location
      if (locations.length > 0) {
        setCurrentLocation(locations[0]);
      }
    }
  }, []);

  useEffect(() => {
    // Save locations to localStorage whenever they change
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  const handleLocationSave = (location: SavedLocation) => {
    setSavedLocations(prev => [...prev, location]);
    setCurrentLocation(location);
  };

  const handleLocationDelete = (id: string) => {
    setSavedLocations(prev => prev.filter(loc => loc.id !== id));
    if (currentLocation.id === id && savedLocations.length > 0) {
      setCurrentLocation(savedLocations[0]);
    }
  };

  const checkConditions = (): boolean => {
    if (!weather || !surf) return false;
    
    return (
      weather.temp >= alarmSettings.minTemp &&
      weather.windSpeed <= alarmSettings.maxWindSpeed &&
      surf.waveHeight >= alarmSettings.minWaveHeight
    );
  };

  const handleAlarmToggle = (type: 'primary' | 'backup') => {
    setAlarmSettings(prev => ({
      ...prev,
      [type === 'primary' ? 'enabled' : 'backupEnabled']: !prev[type === 'primary' ? 'enabled' : 'backupEnabled']
    }));
  };

  // Add a test function
  const testAlarm = () => {
    console.log('Testing alarm...');
    console.log('Audio source:', alarmSound.src); // Log the full audio source URL
    try {
      alarmSound.play()
        .then(() => {
          console.log('Audio playing successfully');
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          console.log('Audio state:', {
            src: alarmSound.src,
            readyState: alarmSound.readyState,
            paused: alarmSound.paused,
            error: alarmSound.error
          });
        });
      triggerAlarm('Test alarm - checking sound! 🔊');
    } catch (error) {
      console.error('Error in testAlarm:', error);
    }
  };

  return (
    <>
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/30 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl"></div>
        
        <div className="text-center mb-10 relative">
          <h1 className="text-6xl font-extralight text-gray-900 mb-2 tracking-tight">
            {format(currentTime, 'HH:mm')}
          </h1>
          <span className="text-2xl font-light text-indigo-500/80">
            {format(currentTime, 'ss')}
          </span>
          <p className="text-gray-500 text-sm font-medium mt-2">
            {format(currentTime, 'EEEE, MMMM do, yyyy')}
          </p>
        </div>

        <div className="space-y-8 relative">
          <LocationPicker
            currentLocation={currentLocation}
            savedLocations={savedLocations}
            onLocationChange={setCurrentLocation}
            onLocationSave={handleLocationSave}
            onLocationDelete={handleLocationDelete}
          />

          {/* Primary Alarm */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Bell className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Surf Conditions Alarm</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={alarmSettings.enabled}
                  onChange={() => handleAlarmToggle('primary')}
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200 ease-in-out peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:shadow-sm after:transition-all"></div>
              </label>
            </div>

            <input
              type="time"
              value={alarmSettings.time}
              onChange={(e) => setAlarmSettings(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-3 text-lg font-light bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>

          {/* Weather Conditions Settings */}
          <div className="grid grid-cols-3 gap-4">
            {/* Temperature Input */}
            <div className="group flex flex-col items-center p-4 bg-black/5 rounded-2xl backdrop-blur-sm hover:bg-black/10 transition-all duration-200">
              <div className="p-2 bg-amber-100 rounded-xl mb-2">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
              <label className="text-xs font-medium text-gray-600 mb-2">Min Temperature</label>
              <div className="relative w-full">
                <input
                  type="number"
                  value={alarmSettings.minTemp}
                  onChange={(e) => setAlarmSettings(prev => ({ ...prev, minTemp: Number(e.target.value) }))}
                  className="w-full text-center pr-8 py-2 bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Min"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">°C</span>
              </div>
            </div>

            {/* Wind Speed Input */}
            <div className="group flex flex-col items-center p-4 bg-black/5 rounded-2xl backdrop-blur-sm hover:bg-black/10 transition-all duration-200">
              <div className="p-2 bg-blue-100 rounded-xl mb-2">
                <Wind className="w-6 h-6 text-blue-600" />
              </div>
              <label className="text-xs font-medium text-gray-600 mb-2">Max Wind Speed</label>
              <div className="relative w-full">
                <input
                  type="number"
                  value={alarmSettings.maxWindSpeed}
                  onChange={(e) => setAlarmSettings(prev => ({ ...prev, maxWindSpeed: Number(e.target.value) }))}
                  className="w-full text-center pr-12 py-2 bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Max"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">km/h</span>
              </div>
            </div>

            {/* Wave Height Input */}
            <div className="group flex flex-col items-center p-4 bg-black/5 rounded-2xl backdrop-blur-sm hover:bg-black/10 transition-all duration-200">
              <div className="p-2 bg-blue-100 rounded-xl mb-2">
                <Waves className="w-6 h-6 text-blue-600" />
              </div>
              <label className="text-xs font-medium text-gray-600 mb-2">Min Wave Height</label>
              <div className="relative w-full">
                <input
                  type="number"
                  value={alarmSettings.minWaveHeight}
                  onChange={(e) => setAlarmSettings(prev => ({ ...prev, minWaveHeight: Number(e.target.value) }))}
                  className="w-full text-center pr-8 py-2 bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Min"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">m</span>
              </div>
            </div>
          </div>

          {/* Backup Alarm - Now positioned after weather conditions */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Backup Alarm</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={alarmSettings.backupEnabled}
                  onChange={() => handleAlarmToggle('backup')}
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer peer-checked:bg-gray-500 transition-colors duration-200 ease-in-out peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:shadow-sm after:transition-all"></div>
              </label>
            </div>

            <input
              type="time"
              value={alarmSettings.backupTime}
              onChange={(e) => setAlarmSettings(prev => ({ ...prev, backupTime: e.target.value }))}
              className="w-full px-4 py-3 text-lg font-light bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200"
            />
          </div>

          {/* Current Conditions Display */}
          {weather && surf && (
            <div className="mt-6 p-6 bg-black/5 rounded-2xl backdrop-blur-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Current Conditions</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Temperature <span className="text-gray-500">{weather.temp}°C</span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Wind Speed <span className="text-gray-500">{weather.windSpeed} km/h</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Wave Height <span className="text-gray-500">{surf.waveHeight}m</span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Wave Period <span className="text-gray-500">{surf.wavePeriod}s</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <AlarmOverlay />
      <button
        onClick={testAlarm}
        className="absolute top-4 right-4 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200"
      >
        Test Alarm 🔊
      </button>
    </>
  );
}