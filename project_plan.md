# The Acquired Universe

An interactive, time-traveling world map that visualizes:

1. The companies discussed on Acquired (by episode release date).
2. The global distribution of listeners over time.

This is a lightweight, low-cost side project focused primarily on UI/UX and temporal visualization.

---

# 1. Vision

**The Acquired Universe** is a dynamic map-based visualization tool that answers:

> What did the world of Acquired look like at any point in time?

Users can:

- Move a timeline slider to a specific month/year.
- See all episodes released up to that date.
- See listener distribution up to that date.
- Press a "Play" button to animate growth month-by-month until the present.

The project emphasizes:

- Beautiful UI
- Smooth time-based animation
- Clean map interaction
- Minimal infrastructure cost
- Privacy by design (no login, no precise location)

---

# 2. Product Scope (MVP)

This is a side project. Keep it small and elegant.

## Included in MVP

- 🌍 Interactive world map
- 🕒 Timeline slider (Month-Year resolution)
- ▶ Playback button (auto-advance months)
- 🏢 Episode layer (company markers)
- 👥 Listener distribution layer (city-based aggregation)
- ➕ Simple "Add Yourself" form (anonymous)

## Not Included (Phase 1)

- Authentication
- User accounts
- Messaging
- Exact geolocation
- Complex analytics dashboards

---

# 3. Core Features (Developer-Friendly Breakdown)

---

## 3.1 Timeline System (Core Engine)

### Behavior

- Horizontal slider with month-year granularity
- Range: First Acquired episode → Current month
- Playback button auto-increments month
- Smooth UI transitions when date changes

### Functional Logic

When date changes to `selectedDate`:

- Filter episodes where `release_date <= selectedDate`
- Filter listeners where `entry_date <= selectedDate`
- Re-render both layers

### Technical Notes

- Internally represent dates as `YYYY-MM`
- Store as string or integer (`202003`)
- Precompute sorted timeline array


## 3.2 Episode Layer (Companies)

Each episode is anchored to company HQ coordinates.

### Display

  - Company name
  - Episode release date
  - Market cap at release
  - Short description
  - Expand side panel with full metadata
  - Side Panel: Instead of a simple popup, use a "Glassmorphism" overlay. When a user clicks a company (e.g., Sequoia or Nintendo), the map should subtly dim, and a blurred panel should slide in with:
    - Link to the Spotify/Apple Podcast episode
    - Key "Acquired" themes (e.g., "Regulatory Capture," "Network Effects")

### Marker Behavior


### Optional Enhancement

  - Marker scaling: Scale marker size by how recently the episode aired (newer = larger, older = smaller)


## 3.3 Listener Distribution Layer

Users are represented by city-level aggregation.

### Privacy Model

Only store: city & started listening date (month + year)

No: personal info

### Display

  - Exponential Scaling: If you get 5,000 "Taipei" listeners, a single circle might cover the whole island. Implement exponential scaling for the radius:
    $Radius = \sqrt{count} \times \text{factor}$

### Aggregation Logic

Example:

```json
{
  "Taipei_2022-03": 12
}
````

On each timeline update:

* Aggregate listeners by city
* Render circle sized by count


## 3.6 Side Panel (Glassmorphism Overlay)

When a company marker is clicked:

- The map dims subtly
- A blurred, glass-like panel slides in from the side
- Panel contents:
  - Company metadata
  - Link to Spotify/Apple Podcast episode
  - Key "Acquired" themes (e.g., "Regulatory Capture," "Network Effects")
  - Episode description
  - Market cap at release
  - Release date

Design: Glassmorphism overlay, smooth slide-in animation, blurred background, premium feel.
## 3.4 Playback System

### Behavior

* Play button:

  * Advances month every X milliseconds
  * Stops at current date
* Pause button
* Reset button (optional)

### Implementation Approach

* Use `setInterval`
* Store timeline index
* Auto-advance state
* Trigger map re-render on each increment

---

## 3.5 Add Yourself Form (Anonymous Submission)

Simple modal:

Fields:

* City (autocomplete)
* Month-Year started listening

Submit:

* Append to key-value storage
* No login required

Spam Mitigation:

* Basic rate limiting (optional)
* Cloudflare Turnstile or simple CAPTCHA (optional)

---

# 4. UI Emphasis (Design Principles)

This project lives or dies by UI quality.

## 4.1 Visual Identity

* Dark mode by default
* Subtle grid background
* Soft glowing markers
* Smooth transitions
* Clean typography

Think:

* Bloomberg Terminal meets modern WebGL map
* Calm, premium, data-centric

---

## 4.2 Layout Structure

```
--------------------------------------------------
|                Header (Title & Dropdown)       |
--------------------------------------------------
|                                                |
|                Interactive Map                 |
|  [Play /Pause] [Timeline Slider]               |
|                                                |
--------------------------------------------------
|                     Footer                     |
--------------------------------------------------
```

---

## 4.3 Microinteractions

* Marker fade-in
* Circle resizing animation
* Timeline scrub preview
* Smooth zoom transitions
* Hover elevation effects

---

# 5. Data Model (Simple Key-Value Focus)

No heavy relational DB required.

---

## 5.1 Episodes Data (Static JSON)

```json
[
  {
    "company": "Apple",
    "release_date": "2017-03",
    "hq": { "lat": 37.3349, "lng": -122.0090 },
    "market_cap_at_release": 750000000000,
    "description": "The story of Apple...",
    "episode_url": "..."
  }
]
```

This can live as:

* Static JSON file in repo
* Or small KV storage

---

## 5.2 Listener Data (KV Structure)

Minimal structure:

```json
[
  {
    "city": "Taipei",
    "lat": 25.0330,
    "lng": 121.5654,
    "entry_date": "2022-03"
  }
]
```

Storage Options:

* Cloudflare KV
* Supabase (free tier)
* Firebase Firestore (free tier)
* Simple JSON file (if ultra low traffic)

For cost minimization:

* Supabase free tier is sufficient
* Or Vercel KV

---

# 6. Proposed Tech Stack (Cheap + Simple)

---

## Frontend

* **Next.js (App Router)**
* **TypeScript**
* **TailwindCSS**
* **Framer Motion** (animations)
* **Mapbox GL JS** or **MapLibre GL**

Why:

* Strong ecosystem
* Easy deployment
* Free hosting on Vercel

---

## Map Layer

* MapLibre GL

---

## Backend

* Next.js API routes
* Supabase client

---

## Database

* Supabase (Postgres + free tier)

---

## Hosting

* Vercel

---

# 7. Suggested Folder Structure

```
/app
  /components
    Timeline.tsx
    PlaybackControls.tsx
    MapView.tsx
    EpisodeMarker.tsx
    ListenerLayer.tsx
    SidePanel.tsx
  /data
    episodes.json
  /utils
    dateUtils.ts
    aggregation.ts
  /api
    add-listener.ts
```

---

# 8. Development Phases

---

## Phase 1 – Static Visualization

* Hardcoded episodes
* Hardcoded listeners
* Timeline works
* Playback works

---

## Phase 2 – Real Data Input

* Add anonymous submission form
* Store in database
* Fetch dynamically

---

## Phase 3 – UI Polish

* Animation tuning
* Marker glow
* Smooth clustering
* Dark theme refinement

---

# 9. Performance Considerations

* Pre-aggregate listener counts in memory
* Memoize timeline filters
* Avoid full map re-mount
* Use clustering provided by map library
* Debounce timeline scrubbing