// page.tsx

"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Timeline from "./components/Timeline";
import PlaybackControls from "./components/PlaybackControls";
import MapView from "./components/MapView";
import EpisodeMarker from "./components/EpisodeMarker";
import ListenerLayer from "./components/ListenerLayer";
import SidePanel from "./components/SidePanel";
import AddYourselfModal from "./components/AddYourselfModal";
import { aggregateListeners } from "./utils/aggregation";
import { incrementYYYYMM, compareYYYYMM } from "./utils/dateUtils";
import { USE_DB } from "./utils/config";
import episodesData from "./data/episodes.json";
import listenersJson from "./data/listeners.json";
import type { Episode, Listener } from "../types/data";
import { useMapProjection } from "./components/MapView";

// Listener aggregation shape
type ListenerAgg = {
  [city: string]: {
    lat: number;
    lng: number;
    count: number;
  };
};

// Defined at MODULE SCOPE so React sees a stable component identity.
// If defined inside Home() a new function reference is created on every render,
// causing React to unmount/remount the entire subtree and re-fire Framer Motion
// initial animations on every map drag/timeline tick (the blinking issue).
function MapOverlayContent({
  filteredEpisodes,
  listenerAgg,
  timeline,
  selected,
  panelEpisode,
  setPanelEpisode,
}: {
  filteredEpisodes: Episode[];
  listenerAgg: ListenerAgg;
  timeline: string[];
  selected: string;
  panelEpisode: Episode | null;
  setPanelEpisode: (ep: Episode) => void;
}) {
  const project = useMapProjection();
  if (!project) return null;
  return (
    <>
      {filteredEpisodes.map((ep) => {
        const xy = project([ep.hq.lng, ep.hq.lat]);
        if (!xy) return null;
        const [x, y] = xy;
        return (
          <EpisodeMarker
            key={ep.company}
            episode={ep}
            isSelected={panelEpisode?.company === ep.company}
            onClick={() => setPanelEpisode(ep)}
            scale={1 + 0.5 * (timeline.indexOf(selected) - timeline.indexOf(ep.release_date) < 6 ? 1 : 0)}
            x={x}
            y={y}
          />
        );
      })}
      {Object.entries(listenerAgg).map(([city, { lat, lng, count }]) => {
        const xy = project([lng, lat]);
        if (!xy) return null;
        const [x, y] = xy;
        return <ListenerLayer key={city} x={x} y={y} count={count} />;
      })}
    </>
  );
}

// Build timeline array from first episode to current month
function buildTimeline(episodes: Episode[]): string[] {
  const min = episodes.reduce((a, b) => (a.release_date < b.release_date ? a : b)).release_date;
  const now = new Date();
  const max = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const arr = [];
  let cur = min;
  while (compareYYYYMM(cur, max) <= 0) {
    arr.push(cur);
    cur = incrementYYYYMM(cur);
  }
  return arr;
}

export default function Home() {
  // Memoized so the reference is stable — prevents the initializer useEffect
  // from re-running on every render (buildTimeline would otherwise return a
  // new array reference each time).
  const timeline = useMemo(() => buildTimeline(episodesData as Episode[]), []);

  // Initialize to the latest date directly so markers are visible on first render.
  const [selected, setSelected] = useState<string>(() => {
    const tl = buildTimeline(episodesData as Episode[]);
    return tl[tl.length - 1];
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [panelEpisode, setPanelEpisode] = useState<Episode | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localListeners, setLocalListeners] = useState<Listener[]>(
    USE_DB ? [] : (listenersJson as Listener[])
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When USE_DB=true, load all listeners from the API on mount
  useEffect(() => {
    if (!USE_DB) return;
    fetch("/api/listeners")
      .then(r => r.json())
      .then((data: Listener[]) => setLocalListeners(data))
      .catch(err => console.error("Failed to load listeners:", err));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSelected((prev) => {
          const idx = timeline.indexOf(prev);
          if (idx < timeline.length - 1) {
            return timeline[idx + 1];
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 900);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeline]);

  // Filter episodes and listeners by selected date
  const filteredEpisodes = useMemo(
    () => (episodesData as Episode[]).filter(e => e.release_date <= selected),
    [selected]
  );
  const listenerAgg = useMemo(
    () => aggregateListeners(localListeners, selected),
    [localListeners, selected]
  );

  // Memoize center so MapView never receives a new array reference (which could
  // otherwise confuse reconciliation even if the map itself ignores prop updates).
  const center = useMemo((): [number, number] => {
    const allCoords = (episodesData as Episode[]).map(e => [e.hq.lng, e.hq.lat]);
    return allCoords.length
      ? [
          allCoords.reduce((a, b) => a + b[0], 0) / allCoords.length,
          allCoords.reduce((a, b) => a + b[1], 0) / allCoords.length,
        ]
      : [0, 0];
  }, []);

  async function handleAddListener(data: { city: string; entry_date: string }) {
    if (USE_DB) {
      try {
        await fetch("/api/listeners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        // Refresh from DB to get accurate aggregated counts
        const updated: Listener[] = await fetch("/api/listeners").then(r => r.json());
        setLocalListeners(updated);
      } catch (err) {
        console.error("Failed to save listener:", err);
      }
    } else {
      // JSON mode: optimistically add a local entry with count=1
      setLocalListeners(prev => [...prev, { ...data, count: 1 }]);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <header className="py-4 px-8 text-2xl font-bold tracking-tight bg-zinc-900 shadow">
        The Acquired Universe
      </header>
      <main className="flex flex-col items-center flex-1 w-full max-w-5xl mx-auto py-8 gap-4">
        <button
          className="mb-2 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition self-end"
          onClick={() => setShowAddModal(true)}
        >
          Add Yourself
        </button>
        <div className="relative w-full h-[60vh] rounded-xl overflow-hidden bg-zinc-800 shadow-lg">
          <MapView center={center} zoom={2}>
            <MapOverlayContent
              filteredEpisodes={filteredEpisodes}
              listenerAgg={listenerAgg}
              timeline={timeline}
              selected={selected}
              panelEpisode={panelEpisode}
              setPanelEpisode={setPanelEpisode}
            />
          </MapView>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-between">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onReset={() => setSelected(timeline[0])}
            showReset
          />
          <Timeline
            timeline={timeline}
            selected={selected}
            onChange={d => {
              setSelected(d);
              setIsPlaying(false);
            }}
          />
        </div>
        {/* SidePanel overlay */}
        <SidePanel episode={panelEpisode} onClose={() => setPanelEpisode(null)} />
        {/* Add Yourself Modal */}
        <AddYourselfModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddListener}
        />
      </main>
      <footer className="py-4 text-center text-zinc-400 text-xs bg-zinc-900">
        &copy; {new Date().getFullYear()} The Acquired Universe
      </footer>
    </div>
  );
}
