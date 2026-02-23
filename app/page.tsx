
"use client";
import React, { useState, useEffect, useRef } from "react";
import Timeline from "./components/Timeline";
import PlaybackControls from "./components/PlaybackControls";
import MapView from "./components/MapView";
import EpisodeMarker from "./components/EpisodeMarker";
import ListenerLayer from "./components/ListenerLayer";
import SidePanel from "./components/SidePanel";
import AddYourselfModal from "./components/AddYourselfModal";
import { aggregateListeners } from "./utils/aggregation";
import { incrementYYYYMM, compareYYYYMM } from "./utils/dateUtils";
import episodesData from "./data/episodes.json";
import listenersData from "./data/listeners.json";
import type { Episode, Listener } from "../types/data";

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
  const [selected, setSelected] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [panelEpisode, setPanelEpisode] = useState<Episode | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localListeners, setLocalListeners] = useState<Listener[]>(listenersData as Listener[]);
  const timeline = buildTimeline(episodesData as Episode[]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSelected(timeline[0]);
  }, [timeline]);

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
  const filteredEpisodes = (episodesData as Episode[]).filter(e => e.release_date <= selected);
  const listenerAgg = aggregateListeners(localListeners, selected);

  // Map center: midpoint between all HQs (simple average, [lng, lat])
  const allCoords = filteredEpisodes.map(e => [e.hq.lng, e.hq.lat]);
  const center: [number, number] = allCoords.length
    ? [
        allCoords.reduce((a, b) => a + b[0], 0) / allCoords.length, // avgLng
        allCoords.reduce((a, b) => a + b[1], 0) / allCoords.length, // avgLat
      ]
    : [0, 0];

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
            {/* Render episode markers (projected as placeholder) */}
            {filteredEpisodes.map((ep, i) => (
              <EpisodeMarker
                key={ep.company}
                episode={ep}
                isSelected={panelEpisode?.company === ep.company}
                onClick={() => setPanelEpisode(ep)}
                scale={1 + 0.5 * ((timeline.indexOf(selected) - timeline.indexOf(ep.release_date)) < 6 ? 1 : 0)}
              />
            ))}
            {/* Render listener circles (projected as placeholder) */}
            {Object.entries(listenerAgg).map(([city, { lat, lng, count }]) => (
              <ListenerLayer key={city} lat={lat} lng={lng} count={count} />
            ))}
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
          onSubmit={data => {
            setLocalListeners(prev => [...prev, data]);
          }}
        />
      </main>
      <footer className="py-4 text-center text-zinc-400 text-xs bg-zinc-900">
        &copy; {new Date().getFullYear()} The Acquired Universe
      </footer>
    </div>
  );
}
