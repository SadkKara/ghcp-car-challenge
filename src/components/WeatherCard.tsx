import type { WeatherData, DailyForecast, SkiResort } from '../types';
import {
  getWeatherDescription,
  getWeatherEmoji,
  getSkiConditions,
} from '../api/weather';
import './WeatherCard.css';

interface WeatherCardProps {
  resort: SkiResort;
  weather: WeatherData;
  daily: DailyForecast[];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function WeatherCard({ resort, weather, daily }: WeatherCardProps) {
  const conditions = getSkiConditions(weather);

  return (
    <div className="weather-card">
      <div className="weather-header">
        <div>
          <h2 className="resort-title">{resort.name}</h2>
          <p className="resort-meta">
            {resort.country} &bull; {resort.elevation.toLocaleString()}m elevation
          </p>
        </div>
        <div
          className="ski-rating-badge"
          style={{ backgroundColor: conditions.color }}
        >
          {conditions.rating}
        </div>
      </div>

      <div className="current-weather">
        <div className="temp-main">
          <span className="weather-emoji">{getWeatherEmoji(weather.weatherCode)}</span>
          <span className="temperature">{Math.round(weather.temperature)}°C</span>
          <span className="weather-desc">{getWeatherDescription(weather.weatherCode)}</span>
        </div>
        <p className="feels-like">Feels like {Math.round(weather.apparentTemperature)}°C</p>
      </div>

      <div className="weather-stats">
        <div className="stat">
          <span className="stat-icon">💨</span>
          <span className="stat-value">{Math.round(weather.windSpeed)} km/h</span>
          <span className="stat-label">Wind</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💨</span>
          <span className="stat-value">{Math.round(weather.windGusts)} km/h</span>
          <span className="stat-label">Gusts</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🌨️</span>
          <span className="stat-value">{Math.round(weather.snowDepth)} cm</span>
          <span className="stat-label">Snow Depth</span>
        </div>
        <div className="stat">
          <span className="stat-icon">❄️</span>
          <span className="stat-value">{weather.snowfall.toFixed(1)} cm</span>
          <span className="stat-label">Fresh Snow</span>
        </div>
        <div className="stat">
          <span className="stat-icon">👁️</span>
          <span className="stat-value">{weather.visibility.toFixed(1)} km</span>
          <span className="stat-label">Visibility</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💧</span>
          <span className="stat-value">{weather.humidity}%</span>
          <span className="stat-label">Humidity</span>
        </div>
      </div>

      {conditions.tips.length > 0 && (
        <div className="conditions-tips">
          {conditions.tips.map((tip, i) => (
            <span key={i} className="tip-badge">{tip}</span>
          ))}
        </div>
      )}

      <div className="forecast-section">
        <h3>7-Day Forecast</h3>
        <div className="forecast-grid">
          {daily.map((day) => (
            <div key={day.date} className="forecast-day">
              <span className="forecast-date">{formatDate(day.date)}</span>
              <span className="forecast-emoji">{getWeatherEmoji(day.weatherCode)}</span>
              <span className="forecast-temps">
                <span className="forecast-max">{Math.round(day.maxTemp)}°</span>
                <span className="forecast-min">{Math.round(day.minTemp)}°</span>
              </span>
              {day.snowfall > 0 && (
                <span className="forecast-snow">❄️ {day.snowfall.toFixed(0)}cm</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
