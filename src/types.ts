export interface WeatherCondition {
  temp: number;
  windSpeed: number;
  windDirection: number; // degrees
}

export interface SurfCondition {
  waveHeight: number;
  wavePeriod: number;
  swellDirection: number; // degrees
}

export interface AlarmSettings {
  time: string;
  minTemp: number;
  maxWindSpeed: number;
  minWaveHeight: number;
  enabled: boolean;
  backupTime: string;
  backupEnabled: boolean;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}