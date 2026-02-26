import { useState, useEffect, useCallback } from 'react';
import type { SkiResort, WeatherData, DailyForecast } from './types';
import { SKI_RESORTS } from './data/resorts';
import { fetchWeather } from './api/weather';
import { ResortList } from './components/ResortList';
import { WeatherCard } from './components/WeatherCard';
import './App.css';

function App() {
  const [selectedResort, setSelectedResort] = useState<SkiResort | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (resort: SkiResort) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const { current, daily: dailyData } = await fetchWeather(
        resort.latitude,
        resort.longitude,
        resort.elevation
      );
      setWeather(current);
      setDaily(dailyData);
    } catch {
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectResort = useCallback(
    (resort: SkiResort) => {
      setSelectedResort(resort);
      loadWeather(resort);
    },
    [loadWeather]
  );

  useEffect(() => {
    handleSelectResort(SKI_RESORTS[0]);
  }, [handleSelectResort]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>⛷️ Ski Resort Weather</h1>
          <p>Real-time mountain weather for your next ski adventure</p>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <ResortList
            resorts={SKI_RESORTS}
            selectedId={selectedResort?.id ?? null}
            onSelect={handleSelectResort}
          />
        </aside>

        <main className="main-content">
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p>Loading weather data...</p>
            </div>
          )}
          {error && !loading && (
            <div className="error">
              <p>❌ {error}</p>
              <button onClick={() => selectedResort && loadWeather(selectedResort)}>
                Retry
              </button>
            </div>
          )}
          {!loading && !error && weather && selectedResort && (
            <WeatherCard resort={selectedResort} weather={weather} daily={daily} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
