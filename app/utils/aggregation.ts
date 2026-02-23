// Aggregation utility for listeners by city and date
import type { Listener } from '../../types/data';

export function aggregateListeners(listeners: Listener[], upToDate: string) {
  const cityMap: Record<string, { lat: number; lng: number; count: number }> = {};
  listeners.forEach((l) => {
    if (l.entry_date <= upToDate) {
      const key = l.city;
      if (!cityMap[key]) {
        cityMap[key] = { lat: l.lat, lng: l.lng, count: 0 };
      }
      cityMap[key].count++;
    }
  });
  return cityMap;
}
