export interface WeatherCondition {
  temp: number;
  description: string;
  windSpeed: number;
}

export interface SurfCondition {
  waveHeight: number;
  wavePeriod: number;
  windDirection: string;
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

export interface SavedLocation extends Location {
  id: string;
}