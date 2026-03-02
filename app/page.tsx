// page.tsx

"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const LP_STORAGE_KEY = "acquired_lp_v1";
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
import CommunitySection from "./components/CommunitySection";

// Listener aggregation shape
type ListenerAgg = {
  [city: string]: {
    lat: number;
    lng: number;
    count: number;
  };
};

type ActiveLayers = "episodes" | "listeners" | "both";

type UserRecord = { city: string; entry_date: string };

// ── Milestone popup shown when timeline crosses the user's entry month ──
function UserMilestonePopup({ record, onDone }: { record: UserRecord; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5500);
    return () => clearTimeout(t);
  }, [onDone]);

  const [month, year] = (() => {
    const [y, m] = record.entry_date.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return [d.toLocaleString("en", { month: "long" }), y];
  })();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)" }} />

      <motion.div
        className="relative text-center px-12 py-10 max-w-sm"
        initial={{ scale: 0.85, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: -16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
      >
        {/* Decorative rule */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="h-px w-12 bg-amber-400/60" />
          <span className="text-amber-400 text-xs tracking-[0.25em] uppercase font-semibold">Chapter One</span>
          <span className="h-px w-12 bg-amber-400/60" />
        </div>

        <p className="text-white/60 text-sm tracking-widest uppercase mb-2">The month you became a listener</p>
        <p
          className="text-5xl font-bold tracking-tight leading-none mb-1"
          style={{ color: "rgb(251,191,36)" }}
        >
          {month}
        </p>
        <p className="text-3xl font-light text-white/80 mb-6">{year}</p>

        <p className="text-white/40 text-xs tracking-wider italic">
          &ldquo;This is where your story began.&rdquo;
        </p>

        {/* Decorative rule */}
        <div className="flex items-center gap-3 mt-6 justify-center">
          <span className="h-px w-20 bg-white/10" />
          <span className="text-white/20 text-xs">✦</span>
          <span className="h-px w-20 bg-white/10" />
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  activeLayers,
  userCity,
}: {
  filteredEpisodes: Episode[];
  listenerAgg: ListenerAgg;
  timeline: string[];
  selected: string;
  panelEpisode: Episode | null;
  setPanelEpisode: (ep: Episode) => void;
  activeLayers: ActiveLayers;
  userCity?: string;
}) {
  const project = useMapProjection();
  if (!project) return null;
  const showEpisodes = activeLayers === "episodes" || activeLayers === "both";
  const showListeners = activeLayers === "listeners" || activeLayers === "both";
  return (
    <>
      {showEpisodes && filteredEpisodes.map((ep) => {
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
      {showListeners && Object.entries(listenerAgg).map(([city, { lat, lng, count }]) => {
        const xy = project([lng, lat]);
        if (!xy) return null;
        const [x, y] = xy;
        return (
          <ListenerLayer
            key={city}
            x={x}
            y={y}
            count={count}
            city={city}
            showTooltip={activeLayers === "listeners"}
            isUserCity={!!userCity && city === userCity}
          />
        );
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
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>("both");
  const [localListeners, setLocalListeners] = useState<Listener[]>(
    USE_DB ? [] : (listenersJson as Listener[])
  );
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const prevSelected = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user record from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LP_STORAGE_KEY);
      if (raw) setUserRecord(JSON.parse(raw) as UserRecord);
    } catch { /* ignore */ }
  }, []);

  // Detect when the timeline crosses the user's entry month
  useEffect(() => {
    if (!userRecord) return;
    const prev = prevSelected.current;
    prevSelected.current = selected;
    // Fire on first arrival at that exact month (from a previous month, or cold-start match)
    if (selected === userRecord.entry_date && prev !== userRecord.entry_date) {
      setShowMilestone(true);
    }
  }, [selected, userRecord]);

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

  const handleAddListener = useCallback(async (data: { city: string; entry_date: string }) => {
    // Persist to localStorage
    try {
      localStorage.setItem(LP_STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
    setUserRecord(data);

    if (USE_DB) {
      try {
        await fetch("/api/listeners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated: Listener[] = await fetch("/api/listeners").then(r => r.json());
        setLocalListeners(updated);
      } catch (err) {
        console.error("Failed to save listener:", err);
      }
    } else {
      setLocalListeners(prev => [...prev, { ...data, count: 1 }]);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* ── Compact header ── */}
      <header className="py-2 px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 shadow">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "#39F9CD" }}
        >
          The Acquired Universe
        </span>
        <button
          className="px-3 py-1.5 rounded text-sm font-semibold text-black transition hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#39F9CD" }}
          onClick={() => setShowAddModal(true)}
        >
          Count Me In
        </button>
      </header>

      <main className="flex flex-col items-center flex-1 w-full max-w-5xl mx-auto px-4 pt-5 pb-8 gap-4">
        {/* ── Intro text ── */}
        <div className="w-full text-sm text-zinc-400 leading-relaxed">
          Welcome to <i className="italic">the Acquired Universe</i> — a time-lapse of every company covered on the{" "}
          <a
            href="https://www.acquired.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: "#39F9CD" }}
          >
            Acquired podcast
          </a>
          {" "} and where its listeners are in the world.
        </div>

        {/* ── Map ── */}
        <div className="relative w-full h-[60vh]">
          <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-800 shadow-lg">
            <MapView center={center} zoom={2}>
              <MapOverlayContent
                filteredEpisodes={filteredEpisodes}
                listenerAgg={listenerAgg}
                timeline={timeline}
                selected={selected}
                panelEpisode={panelEpisode}
                setPanelEpisode={setPanelEpisode}
                activeLayers={activeLayers}
                userCity={userRecord?.city}
              />
            </MapView>
          </div>

          {/* Layer toggle */}
          <div className="absolute top-3 right-3 z-10 flex gap-1 bg-zinc-900/85 backdrop-blur-sm rounded-lg p-1 border border-zinc-700">
            {([
              { id: "episodes", label: "Company Universe", icon: "" },
              { id: "listeners", label: "Listener Pulse",  icon: "" },
              { id: "both",     label: "Full Universe",    icon: "" },
            ] as { id: ActiveLayers; label: string; icon: string }[]).map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLayers(l.id)}
                className="px-2.5 py-1 rounded text-xs font-medium transition"
                style={
                  activeLayers === l.id
                    ? { backgroundColor: "#39F9CD", color: "#000" }
                    : { color: "#a1a1aa" }
                }
              >
                {l.icon} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── YouTube-style player bar ── */}
        <div className="flex items-center gap-3 w-full px-1 py-1">
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
          initialCity={userRecord?.city}
          initialDate={userRecord?.entry_date}
        />

        {/* Milestone popup */}
        <AnimatePresence>
          {showMilestone && userRecord && (
            <UserMilestonePopup
              record={userRecord}
              onDone={() => setShowMilestone(false)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* ── Community Section ── */}
      <div className="w-full bg-zinc-950 border-t border-zinc-800">
        <CommunitySection />
      </div>

      <footer className="py-12 text-center bg-zinc-900 border-t border-zinc-800">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/acquired_universe.png"
            alt="Acquired Universe"
            width={96}
            height={96}
            className="rounded-full"
            style={{ border: "2px solid rgba(57,249,205,0.25)" }}
          />
          <p className="text-zinc-500 text-xs tracking-widest uppercase">
            Created by{" "}
            <a
              href="https://pcwu2022.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition underline underline-offset-2"
            >
              Po-Chun Wu 
            </a>
            {" "}🇹🇼
          </p>
        </div>
      </footer>
    </div>
  );
}
