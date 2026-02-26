export interface SkiResort {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  windGusts: number;
  snowDepth: number;
  snowfall: number;
  weatherCode: number;
  humidity: number;
  visibility: number;
  precipitationProbability: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  snowfall: number;
  windSpeed: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  snowfall: number;
  windSpeed: number;
  weatherCode: number;
  precipitationProbability: number;
}
