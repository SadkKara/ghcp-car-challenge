import type { SkiResort } from '../types';
import './ResortList.css';

interface ResortListProps {
  resorts: SkiResort[];
  selectedId: string | null;
  onSelect: (resort: SkiResort) => void;
}

export function ResortList({ resorts, selectedId, onSelect }: ResortListProps) {
  const countryGroups = resorts.reduce<Record<string, SkiResort[]>>((acc, resort) => {
    if (!acc[resort.country]) acc[resort.country] = [];
    acc[resort.country].push(resort);
    return acc;
  }, {});

  return (
    <div className="resort-list">
      <h2>🎿 Ski Resorts</h2>
      {Object.entries(countryGroups).map(([country, countryResorts]) => (
        <div key={country} className="country-group">
          <h3 className="country-label">{country}</h3>
          {countryResorts.map((resort) => (
            <button
              key={resort.id}
              className={`resort-item ${selectedId === resort.id ? 'selected' : ''}`}
              onClick={() => onSelect(resort)}
            >
              <span className="resort-name">{resort.name}</span>
              <span className="resort-elevation">⛰️ {resort.elevation.toLocaleString()}m</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
