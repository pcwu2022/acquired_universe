# The Acquired Universe

An interactive, time-travelling world map that visualises every company covered on the [Acquired podcast](https://www.acquired.fm) alongside the global distribution of its listeners — all animated across a playable timeline.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Supabase](https://img.shields.io/badge/Supabase-database-3ECF8E?logo=supabase) ![MapLibre GL](https://img.shields.io/badge/MapLibre-GL-396CB2?logo=maplibre)

---

## What It Does

Drag the timeline slider (or hit Play) to watch the Acquired universe grow month by month:

- **Episode layer** — company HQ markers appear as each episode is released, sized and coloured by recency. Click any marker to open a glassmorphism side panel with episode metadata, market cap, themes, and a link to listen.
- **Listener layer** — city-level circles expand as more listeners join, scaled by $\text{radius} = \sqrt{\text{count}} \times \text{factor}$ to prevent urban dominance.
- **Milestone popup** — if you have added yourself to the map, a "Chapter One" card appears when the playback crosses the month you started listening.
- **Community section** — a brief survey collects listener demographics (age, industry, platform, favourite episode) and displays anonymised aggregate charts.

---

## Features

| Feature | Details |
|---|---|
| Interactive map | MapLibre GL with custom SVG markers |
| Timeline & playback | Month-year slider, auto-advance play button |
| Episode side panel | Glassmorphism overlay, podcast links, themes |
| Listener map | Anonymous city-level pins, exponential radius scaling |
| "Count Me In" | Add your city and listen-start date — stored in Supabase |
| Community survey | Multi-step form; answers stored server-side and locally in IndexedDB |
| Statistics dashboard | Age, industry, and platform charts powered by Recharts |
| Milestone animation | Framer Motion card shown when playback reaches your start month |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, React 19)
- **Map** — [MapLibre GL](https://maplibre.org)
- **Animation** — [Framer Motion](https://www.framer.com/motion/)
- **Charts** — [Recharts](https://recharts.org)
- **Database** — [Supabase](https://supabase.com) (Postgres + REST API)
- **Styling** — Tailwind CSS v4
- **Language** — TypeScript

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier is sufficient)

### 1. Clone & install

```bash
git clone https://github.com/pcwu2022/acquired_universe.git
cd acquired_universe
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_PASSWORD=<your-supabase-db-password>
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
├── page.tsx                  # Root page — timeline, map, milestone popup
├── components/
│   ├── MapView.tsx           # MapLibre GL wrapper
│   ├── Timeline.tsx          # Slider + date state
│   ├── PlaybackControls.tsx  # Play / pause / speed
│   ├── EpisodeMarker.tsx     # SVG company markers
│   ├── ListenerLayer.tsx     # City circle overlays
│   ├── SidePanel.tsx         # Glassmorphism episode detail panel
│   ├── AddYourselfModal.tsx  # "Count Me In" form
│   └── CommunitySection/     # Survey, stats dashboard, CTA buttons
├── data/
│   ├── episodes.json         # Acquired episode catalogue
│   ├── cities.json           # City → coordinates lookup
│   └── listeners.json        # Seeded / fallback listener data
├── utils/
│   ├── supabase.ts           # Supabase client
│   ├── aggregation.ts        # Listener city aggregation
│   ├── dateUtils.ts          # YYYY-MM helpers
│   └── config.ts             # Feature flags (USE_DB etc.)
└── api/
    ├── listeners/            # GET / POST listener records
    ├── community-stats/      # GET / POST survey stats
    └── add-listener.ts       # Legacy add-listener endpoint
types/
└── data.d.ts                 # Shared TypeScript types (Episode, Listener…)
```

---

## Privacy

No personal data is collected. Listeners submit only a city name and the month they started listening. No accounts, no emails, no precise geolocation.

---

## License

MIT
