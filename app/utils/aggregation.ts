// Aggregation utility for listeners by city and date
import type { Listener } from '../../types/data';
import citiesData from '../data/cities.json';

type CityCoords = { name: string; lat: number; lng: number };

// Build a case-insensitive lookup index once at module load
const cityIndex: Record<string, CityCoords> = {};
for (const c of citiesData as CityCoords[]) {
  cityIndex[c.name.toLowerCase()] = c;
}

export function aggregateListeners(
  listeners: Listener[],
  upToDate: string
): Record<string, { lat: number; lng: number; count: number }> {
  const cityMap: Record<string, { lat: number; lng: number; count: number }> = {};

  for (const l of listeners) {
    if (l.entry_date > upToDate) continue;
    const coords = cityIndex[l.city.toLowerCase()];
    if (!coords) continue; // unknown city — skip

    if (!cityMap[l.city]) {
      cityMap[l.city] = { lat: coords.lat, lng: coords.lng, count: 0 };
    }
    cityMap[l.city].count += l.count;
  }

  return cityMap;
}
