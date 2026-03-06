export type Episode = {
  id: number;
  company: string;
  release_date: string; // YYYY-MM
  hq: { lat: number; lng: number };
  sticker: string;
  category: string;
  description: string;
  episode_url: string;
};

export type Listener = {
  city: string;
  entry_date: string; // YYYY-MM
  count: number;      // number of listeners aggregated into this record
};
