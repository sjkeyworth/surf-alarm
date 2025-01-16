import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Bell, Sun, Wind, Waves, Music } from 'lucide-react';
import type { AlarmSettings, WeatherCondition, SurfCondition, SavedLocation } from '../types';
import LocationPicker from './LocationPicker';
import ConditionsMap from './ConditionsMap';

// Update audio instance with new sound file and start time
const alarmSound = new Audio('/surfaris-wipeout-stereo.mp3');
alarmSound.loop = true;

export default function AlarmClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings>({
    time: '06:00',
    minTemp: 15,
    maxWindSpeed: 20,
    minWaveHeight: 3,
    enabled: false,
    backupTime: '07:00',
    backupEnabled: false
  });
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [surf, setSurf] = useState<SurfCondition | null>(null);
  
  // Initialize with Macauleys Beach (Thirroul/Bulli)
  const [currentLocation, setCurrentLocation] = useState<SavedLocation>({
    id: 'macauleys',
    name: 'Macauleys Beach',
    lat: -34.3198,
    lng: 150.9334
  });
  
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    {
      id: 'macauleys',
      name: 'Macauleys Beach',
      lat: -34.3198,
      lng: 150.9334
    }
  ]);

  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<'temp' | 'wind' | 'wave' | null>(null);

  const checkAlarm = useCallback(() => {
    const now = new Date();
    const currentTimeString = format(now, 'HH:mm');
    
    // Track if primary alarm has triggered
    let primaryAlarmTriggered = false;
    
    // Check primary alarm
    if (alarmSettings.enabled && currentTimeString === alarmSettings.time) {
      if (checkConditions()) {
        triggerAlarm('Perfect surf conditions! Time to hit the waves! 🏄‍♂️');
        primaryAlarmTriggered = true;
      } else {
        showToast('Surf conditions not ideal for primary alarm.', 'warning');
      }
    }
    
    // Check backup alarm independently
    if (alarmSettings.backupEnabled && currentTimeString === alarmSettings.backupTime) {
      // Always trigger backup alarm at its time if enabled, regardless of primary alarm
      triggerAlarm('Backup alarm - Time to wake up!');
    }
  }, [alarmSettings, weather, surf]);

  const triggerAlarm = (message: string) => {
    setIsAlarmRinging(true);
    alarmSound.currentTime = 79; // Start at 79 seconds
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
    alarmSound.currentTime = 79; // Reset to 79 seconds when stopped
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

  // Toast functionality
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
    visible: boolean;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(null), 5000);
  };

  const Toast = () => {
    if (!toast?.visible) return null;

    const bgColor = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    }[toast.type];

    return (
      <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg 
        transform transition-all duration-500 ease-in-out flex items-center space-x-2`}>
        {toast.type === 'success' && <Sun className="w-5 h-5" />}
        {toast.type === 'warning' && <Wind className="w-5 h-5" />}
        {toast.type === 'error' && <Waves className="w-5 h-5" />}
        <span>{toast.message}</span>
      </div>
    );
  };

  // Add alarm modal/overlay
  const AlarmOverlay = () => isAlarmRinging ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Time to Wake Up! ⏰</h2>
        
        {/* Surf conditions summary */}
        <div className="mb-6 space-y-4">
          <p className="text-gray-600">
            {checkConditions() 
              ? "Perfect surf conditions! Time to hit the waves! 🏄‍♂️"
              : "Backup alarm - surf conditions not ideal"}
          </p>

          {weather && surf && (
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <p className="text-sm text-gray-600">Current conditions at {currentLocation.name}:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Temperature:</span>
                    <span className="font-medium">{weather.temp}°C</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Wind:</span>
                    <span className="font-medium">{weather.windSpeed} km/h</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Wave Height:</span>
                    <span className="font-medium">{surf.waveHeight}ft</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Period:</span>
                    <span className="font-medium">{surf.wavePeriod}s</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={stopAlarm}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
        >
          Stop Alarm
        </button>
      </div>
    </div>
  ) : null;

  // Conditions Modal Component
  const ConditionsModal = () => {
    if (!isConditionsModalOpen || !editingCondition) return null;

    const getModalContent = () => {
      switch (editingCondition) {
        case 'temp':
          return {
            title: 'Minimum Air Temperature',
            value: alarmSettings.minTemp,
            unit: '°C',
            min: 0,
            max: 50,
            step: 1,
            onChange: (value: number) => setAlarmSettings(prev => ({ ...prev, minTemp: value }))
          };
        case 'wind':
          return {
            title: 'Maximum Wind Speed',
            value: alarmSettings.maxWindSpeed,
            unit: 'km/h',
            min: 0,
            max: 100,
            step: 1,
            onChange: (value: number) => setAlarmSettings(prev => ({ ...prev, maxWindSpeed: value }))
          };
        case 'wave':
          return {
            title: 'Minimum Wave Height',
            value: alarmSettings.minWaveHeight,
            unit: 'ft',
            min: 0,
            max: 30,
            step: 0.5,
            onChange: (value: number) => setAlarmSettings(prev => ({ ...prev, minWaveHeight: value }))
          };
      }
    };

    const content = getModalContent();
    if (!content) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{content.title}</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => content.onChange(Math.max(content.min, content.value - content.step))}
                className="w-12 h-12 flex items-center justify-center text-2xl text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-3xl font-light">{content.value}</span>
                <span className="text-xl text-gray-500 ml-1">{content.unit}</span>
              </div>
              <button
                onClick={() => content.onChange(Math.min(content.max, content.value + content.step))}
                className="w-12 h-12 flex items-center justify-center text-2xl text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>
            <input
              type="range"
              min={content.min}
              max={content.max}
              step={content.step}
              value={content.value}
              onChange={(e) => content.onChange(Number(e.target.value))}
              className="w-full"
            />
            <button
              onClick={() => {
                setIsConditionsModalOpen(false);
                setEditingCondition(null);
              }}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

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

  // Add test function
  const testAlarm = () => {
    triggerAlarm('Test alarm - checking sound! 🔊');
  };

  // Add weather fetching
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!currentLocation) return;
      
      console.log('Starting weather fetch for:', currentLocation.name);
      
      try {
        // Marine data (for waves) - this doesn't require an API key
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&hourly=wave_height,wave_period,wave_direction`;
        console.log('Fetching marine data from:', marineUrl);
        
        const marineResponse = await fetch(marineUrl);
        console.log('Marine response status:', marineResponse.status);
        
        // Log the raw response text for debugging
        const responseText = await marineResponse.text();
        console.log('Marine API raw response:', responseText);
        
        if (!marineResponse.ok) {
          throw new Error(`Marine API returned status ${marineResponse.status}: ${responseText}`);
        }
        
        // Try to parse the response text as JSON
        let marineData;
        try {
          marineData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse marine API response:', e);
          throw new Error(`Invalid JSON response from marine API: ${responseText}`);
        }
        
        console.log('Marine API parsed response:', marineData);

        // Validate marine data structure
        if (!marineData?.hourly?.wave_height || 
            !marineData?.hourly?.wave_period || 
            !marineData?.hourly?.wave_direction ||
            !Array.isArray(marineData.hourly.wave_height) ||
            !Array.isArray(marineData.hourly.wave_period) ||
            !Array.isArray(marineData.hourly.wave_direction)) {
          throw new Error('Invalid marine data format: Missing required wave data');
        }

        // Get current hour's wave data with bounds checking
        const currentHourIndex = new Date().getHours();
        if (currentHourIndex >= marineData.hourly.wave_height.length) {
          throw new Error('Invalid marine data: Hour index out of bounds');
        }

        const waveHeight = marineData.hourly.wave_height[currentHourIndex];
        const wavePeriod = marineData.hourly.wave_period[currentHourIndex];
        const waveDirection = marineData.hourly.wave_direction[currentHourIndex];

        if (typeof waveHeight !== 'number' || 
            typeof wavePeriod !== 'number' || 
            typeof waveDirection !== 'number') {
          throw new Error('Invalid marine data: Wave measurements are not numbers');
        }

        const surfUpdate = {
          waveHeight: Number((waveHeight * 3.28084).toFixed(1)), // Convert meters to feet
          wavePeriod: Number(wavePeriod.toFixed(1)),
          swellDirection: Number(waveDirection.toFixed(0))
        };

        console.log('Setting surf state to:', surfUpdate);
        setSurf(surfUpdate);

        // Weather API call
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!apiKey) {
          throw new Error('OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your environment variables.');
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.lng}&units=metric&appid=${apiKey}`;
        console.log('Fetching weather from:', weatherUrl);
        
        const weatherResponse = await fetch(weatherUrl);
        console.log('Weather response status:', weatherResponse.status);
        
        if (!weatherResponse.ok) {
          const errorData = await weatherResponse.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Weather API error response:', errorData);
          if (weatherResponse.status === 401) {
            showToast('Weather API key is not active yet. Please wait up to 2 hours for activation.', 'warning');
            // Set some default weather data for testing
            setWeather({
              temp: 20,
              windSpeed: 15,
              windDirection: 0 // Default to North
            });
            return;
          }
          throw new Error(`Weather API error: ${errorData.message || weatherResponse.statusText}`);
        }
        
        const weatherData = await weatherResponse.json();
        console.log('Weather API response:', weatherData);

        // Validate weather data structure
        if (!weatherData?.main?.temp || 
            !weatherData?.wind?.speed || 
            !weatherData?.wind?.deg || 
            typeof weatherData.main.temp !== 'number' ||
            typeof weatherData.wind.speed !== 'number' ||
            typeof weatherData.wind.deg !== 'number') {
          throw new Error('Invalid weather data format: Missing required temperature or wind data');
        }

        const weatherUpdate = {
          temp: Math.round(weatherData.main.temp),
          windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
          windDirection: Math.round(weatherData.wind.deg)
        };
        
        console.log('Setting weather state to:', weatherUpdate);
        setWeather(weatherUpdate);

      } catch (error) {
        console.error('Error fetching weather data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data';
        showToast(errorMessage, 'error');
        
        // Set null states to indicate data fetch failure
        setSurf(null);
        setWeather(null);
      }
    };

    // Fetch initially and then every 30 minutes
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentLocation]);

  // Add debug logging for render
  console.log('Current weather state:', weather);
  console.log('Current surf state:', surf);

  // Helper function to convert degrees to cardinal direction
  const degreesToCardinal = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <>
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/30 relative overflow-hidden">
        <div className="text-center mb-4 relative">
          <img 
            src="/WakeyWavey2-removebg.png" 
            alt="WakeyWavey Logo" 
            className="h-48 mx-auto"
            style={{ objectFit: 'contain' }}
          />
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

            <div className="flex items-center justify-center space-x-2">
              <select
                value={alarmSettings.time.split(':')[0]}
                onChange={(e) => {
                  const [_, minutes] = alarmSettings.time.split(':');
                  setAlarmSettings(prev => ({
                    ...prev,
                    time: `${e.target.value.padStart(2, '0')}:${minutes}`
                  }));
                }}
                className="text-4xl font-light bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none px-2 py-1"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-4xl font-light text-gray-400">:</span>
              <select
                value={alarmSettings.time.split(':')[1]}
                onChange={(e) => {
                  const [hours, _] = alarmSettings.time.split(':');
                  setAlarmSettings(prev => ({
                    ...prev,
                    time: `${hours}:${e.target.value}`
                  }));
                }}
                className="text-4xl font-light bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none px-2 py-1"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Alarm will trigger at {alarmSettings.time} if the air temperature is at least {alarmSettings.minTemp}°C, 
              wind speed is below {alarmSettings.maxWindSpeed} km/h, and wave height is at least {alarmSettings.minWaveHeight}ft.
            </p>
          </div>

          {/* Weather Conditions Settings */}
          <div className="grid grid-cols-3 gap-4">
            {/* Temperature Input */}
            <div 
              onClick={() => {
                setEditingCondition('temp');
                setIsConditionsModalOpen(true);
              }}
              className="group flex flex-col items-center p-4 bg-black/5 rounded-2xl backdrop-blur-sm hover:bg-black/10 transition-all duration-200 cursor-pointer"
            >
              <div className="p-2 bg-amber-100 rounded-xl mb-2">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
              <label className="text-xs font-medium text-gray-600 mb-2">Min Air Temperature</label>
              <div className="text-center">
                <span className="text-2xl font-light">{alarmSettings.minTemp}</span>
                <span className="text-gray-500 text-sm font-medium ml-1">°C</span>
              </div>
            </div>

            {/* Wind Speed Input */}
            <div 
              onClick={() => {
                setEditingCondition('wind');
                setIsConditionsModalOpen(true);
              }}
              className="group flex flex-col items-center p-4 bg-black/5 rounded-2xl backdrop-blur-sm hover:bg-black/10 transition-all duration-200 cursor-pointer"
            >
              <div className="p-2 bg-blue-100 rounded-xl mb-2">
                <Wind className="w-6 h-6 text-blue-600" />
              </div>
              <label className="text-xs font-medium text-gray-600 mb-2">Max Wind Speed</label>
              <div className="text-center">
                <span className="text-2xl font-light">{alarmSettings.maxWindSpeed}</span>
                <span className="text-gray-500 text-sm font-medium ml-1">km/h</span>
              </div>
            </div>

            {/* Wave Height Input */}
            <div 
              onClick={() => {
                setEditingCondition('wave');
                setIsConditionsModalOpen(true);
              }}
              className="group flex flex-col items-center p-4 bg-black/5 rounded-2xl backdrop-blur-sm hover:bg-black/10 transition-all duration-200 cursor-pointer"
            >
              <div className="p-2 bg-blue-100 rounded-xl mb-2">
                <Waves className="w-6 h-6 text-blue-600" />
              </div>
              <label className="text-xs font-medium text-gray-600 mb-2">Min Wave Height</label>
              <div className="text-center">
                <span className="text-2xl font-light">{alarmSettings.minWaveHeight}</span>
                <span className="text-gray-500 text-sm font-medium ml-1">ft</span>
              </div>
            </div>
          </div>

          {/* Backup Alarm */}
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

            <div className="flex items-center justify-center space-x-2">
              <select
                value={alarmSettings.backupTime.split(':')[0]}
                onChange={(e) => {
                  const [_, minutes] = alarmSettings.backupTime.split(':');
                  setAlarmSettings(prev => ({
                    ...prev,
                    backupTime: `${e.target.value.padStart(2, '0')}:${minutes}`
                  }));
                }}
                className="text-4xl font-light bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 appearance-none px-2 py-1"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-4xl font-light text-gray-400">:</span>
              <select
                value={alarmSettings.backupTime.split(':')[1]}
                onChange={(e) => {
                  const [hours, _] = alarmSettings.backupTime.split(':');
                  setAlarmSettings(prev => ({
                    ...prev,
                    backupTime: `${hours}:${e.target.value}`
                  }));
                }}
                className="text-4xl font-light bg-white/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 appearance-none px-2 py-1"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Conditions Display */}
          {weather && surf && (
            <div className="mt-6 p-6 bg-black/5 rounded-2xl backdrop-blur-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Current Conditions</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Right now at {currentLocation.name}, the air temperature is {weather.temp}°C with {weather.windSpeed} km/h winds. 
                The waves are {surf.waveHeight}ft high with a {surf.wavePeriod} second period.
                {checkConditions() 
                  ? " These are perfect surfing conditions! 🏄‍♂️"
                  : " Conditions aren't ideal for surfing right now. 🌊"}
              </p>
              <div className="mb-6">
                <ConditionsMap
                  lat={currentLocation.lat}
                  lng={currentLocation.lng}
                  windDirection={weather.windDirection}
                  swellDirection={surf.swellDirection}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Temperature <span className="text-gray-500">{weather.temp}°C</span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Wind Speed <span className="text-gray-500">{weather.windSpeed} km/h</span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Wind Direction <span className="text-gray-500">{degreesToCardinal(weather.windDirection)} ({weather.windDirection}°)</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Wave Height <span className="text-gray-500">{surf.waveHeight}ft</span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Wave Period <span className="text-gray-500">{surf.wavePeriod}s</span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex justify-between">
                    Swell Direction <span className="text-gray-500">{degreesToCardinal(surf.swellDirection)} ({surf.swellDirection}°)</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={testAlarm}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors duration-200 bg-red-50 rounded-xl"
            aria-label="Test alarm sound"
          >
            <Music className="w-4 h-4" />
            <span>Test Alarm</span>
          </button>
        </div>
      </div>
      <AlarmOverlay />
      <ConditionsModal />
    </>
  );
}