export type Episode = {
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
  lat: number;
  lng: number;
  entry_date: string; // YYYY-MM
};
