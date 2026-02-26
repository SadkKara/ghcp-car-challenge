import type { WeatherData, DailyForecast } from '../types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(
  latitude: number,
  longitude: number,
  elevation: number
): Promise<{ current: WeatherData; daily: DailyForecast[] }> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    elevation: elevation.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_gusts_10m',
      'snow_depth',
      'snowfall',
      'weather_code',
      'visibility',
      'precipitation_probability',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'snowfall_sum',
      'wind_speed_10m_max',
      'weather_code',
      'precipitation_probability_max',
    ].join(','),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: 'auto',
    forecast_days: '7',
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  const current: WeatherData = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGusts: data.current.wind_gusts_10m,
    snowDepth: data.current.snow_depth * 100, // convert m to cm
    snowfall: data.current.snowfall,
    weatherCode: data.current.weather_code,
    visibility: data.current.visibility / 1000, // convert m to km
    precipitationProbability: data.current.precipitation_probability ?? 0,
  };

  const daily: DailyForecast[] = data.daily.time.map(
    (date: string, i: number) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[i],
      minTemp: data.daily.temperature_2m_min[i],
      snowfall: data.daily.snowfall_sum[i] ?? 0,
      windSpeed: data.daily.wind_speed_10m_max[i],
      weatherCode: data.daily.weather_code[i],
      precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
    })
  );

  return { current, daily };
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Fog';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌦️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

export function getSkiConditions(weather: WeatherData): {
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  tips: string[];
} {
  const tips: string[] = [];
  let score = 0;

  // Snow depth scoring
  if (weather.snowDepth >= 100) score += 3;
  else if (weather.snowDepth >= 50) score += 2;
  else if (weather.snowDepth >= 20) score += 1;
  else tips.push('Low snow base');

  // Temperature scoring
  if (weather.temperature >= -15 && weather.temperature <= -2) score += 3;
  else if (weather.temperature > -2 && weather.temperature <= 2) score += 2;
  else if (weather.temperature > 2 && weather.temperature <= 5) score += 1;
  else if (weather.temperature < -15) tips.push('Extremely cold');
  else tips.push('Above-freezing temperatures');

  // Wind scoring
  if (weather.windSpeed <= 20) score += 2;
  else if (weather.windSpeed <= 40) score += 1;
  else tips.push('High winds - some lifts may be closed');

  // Visibility scoring
  if (weather.visibility >= 10) score += 2;
  else if (weather.visibility >= 5) score += 1;
  else tips.push('Low visibility');

  // Fresh snow bonus
  if (weather.snowfall > 0) {
    score += 1;
    tips.push('Fresh snow falling! 🎿');
  }

  if (score >= 9) return { rating: 'Excellent', color: '#2ecc71', tips };
  if (score >= 6) return { rating: 'Good', color: '#3498db', tips };
  if (score >= 3) return { rating: 'Fair', color: '#f39c12', tips };
  return { rating: 'Poor', color: '#e74c3c', tips };
}
