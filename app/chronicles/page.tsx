"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageFooter from "../components/PageFooter";
import episodesData from "../data/episodes.json";
import timelineData from "../data/timeline.json";
import worldEventsData from "../data/world_events.json";
import type { Episode } from "../../types/data";
import { CATEGORY_COLORS } from "../utils/categories";
import SidePanel from "../components/SidePanel";
import { EMOJI_MAP } from "../utils/EMOJI_MAP";

// ── Types ─────────────────────────────────────────────────────────────────────

type TimelineTimestamp = {
  month: string;
  title: string;
  description: string;
  emoji: string;
};

type TimelineEntry = {
  episode_ids: number[];
  company: string;
  timestamps: TimelineTimestamp[];
};

function parseEmoji(raw: string): string {
  const match = raw.match(/^:(.+):$/);
  if (!match) return raw;
  return EMOJI_MAP[match[1]] ?? "◉";
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function monthIndex(yyyyMM: string): number {
  const [y, m] = yyyyMM.split("-").map(Number);
  return y * 12 + m - 1;
}

function formatMonthLabel(yyyyMM: string): string {
  const [y, m] = yyyyMM.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// ── Layout constants ──────────────────────────────────────────────────────────

const LEFT_PANEL_W = 220;
const WORLD_ROW_HEIGHT = 72;   // slightly shorter — world events have no sticker
const DEFAULT_PX_PER_MONTH = 22;
const ZOOM_STEP = 3;
const ZOOM_MIN = 1;
const ZOOM_MAX = 100;
const ROW_HEIGHT = 88;
const LINE_Y = 36;         // px from top of row to the center of the timeline line
const FADE_PX = 90;        // width of the trailing fade after last event
const PAD_MONTHS_BEFORE = 4;
const PAD_MONTHS_AFTER = 10;

// ── Tooltip ───────────────────────────────────────────────────────────────────

type TooltipState = {
  anchorX: number;  // viewport x
  anchorY: number;  // viewport y
  month: string;
  title: string;
  description: string;
  color: string;
};

function Tooltip({ state }: { state: TooltipState | null }) {
  if (!state) return null;
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key="tooltip"
          className="fixed z-60 pointer-events-none"
          style={{
            left: state.anchorX,
            top: state.anchorY + 18,
            transform: "translateX(-50%)",
            maxWidth: 260,
          }}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="bg-zinc-900 rounded-xl p-4 shadow-2xl border"
            style={{ borderColor: state.color + "55" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
              {formatMonthLabel(state.month)}
            </p>
            <h4 className="text-sm font-bold text-white leading-snug mb-1.5">
              {state.title}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {state.description}
            </p>
            <div className="mt-3 h-px" style={{ background: state.color + "33" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── World Events Row ──────────────────────────────────────────────────────────

const WORLD_COLOR = "#a78bfa"; // violet-400 — neutral, distinct from category colors
const WORLD_LINE_Y = 28;       // slightly above center to leave room for labels below

type WorldEvent = { month: string; title: string; description: string; emoji: string };

function WorldEventsRow({
  events,
  globalMinIdx,
  totalMonths,
  pxPerMonth,
  onMarkerClick,
  activeMarker,
  setActiveMarker,
}: {
  events: WorldEvent[];
  globalMinIdx: number;
  totalMonths: number;
  pxPerMonth: number;
  onMarkerClick: (key: string, state: TooltipState) => void;
  activeMarker: string | null;
  setActiveMarker: (k: string | null) => void;
}) {
  const lineWidth = totalMonths * pxPerMonth;
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  return (
    <div
      className="flex border-b"
      style={{ height: WORLD_ROW_HEIGHT, borderColor: "rgba(167,139,250,0.12)" }}
    >
      {/* Left panel */}
      <div
        className="sticky left-0 z-10 flex flex-col items-center justify-center gap-0.5 shrink-0 border-r"
        style={{
          width: LEFT_PANEL_W,
          background: "rgb(9,9,11)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <span className="text-base">🌍</span>
        <span
          className="text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: WORLD_COLOR }}
        >
          World Events
        </span>
      </div>

      {/* Timeline track */}
      <div className="relative flex-1">
        {/* Full-width dim line */}
        <div
          className="absolute"
          style={{
            top: WORLD_LINE_Y,
            left: 0,
            width: lineWidth,
            height: 1,
            background: `${WORLD_COLOR}22`,
          }}
        />

        {/* Event markers */}
        {events.map((ev, i) => {
          const x = (monthIndex(ev.month) - globalMinIdx) * pxPerMonth;
          const key = `world__${i}`;
          const isActive = activeMarker === key;
          const isPopOut = isActive || hoveredMarker === key;
          const emoji = parseEmoji(ev.emoji);

          return (
            <div
              key={key}
              className="absolute flex flex-col items-center"
              style={{
                left: x,
                top: WORLD_LINE_Y - 12,
                transform: "translateX(-50%)",
                width: 84,
              }}
            >
              <button
                className="w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer relative z-10 select-none"
                style={{
                  borderColor: isPopOut ? WORLD_COLOR : WORLD_COLOR + "66",
                  background: "rgb(9,9,11)",
                  boxShadow: isPopOut ? `0 0 10px 2px ${WORLD_COLOR}55` : "none",
                  transform: isPopOut ? "scale(1.25)" : "scale(1)",
                  fontSize: "0.7rem",
                }}
                onMouseEnter={() => setHoveredMarker(key)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) { setActiveMarker(null); return; }
                  const rect = e.currentTarget.getBoundingClientRect();
                  onMarkerClick(key, {
                    anchorX: rect.left + rect.width / 2,
                    anchorY: rect.top,
                    month: ev.month,
                    title: ev.title,
                    description: ev.description,
                    color: WORLD_COLOR,
                  });
                  setActiveMarker(key);
                }}
                title={ev.title}
                aria-label={ev.title}
              >
                {emoji}
              </button>

              <span
                className="mt-0.5 text-[8px] leading-tight text-center block"
                style={{
                  color: WORLD_COLOR + "99",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxWidth: 82,
                  lineHeight: "1.25",
                } as React.CSSProperties}
              >
                {ev.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Timeline row ──────────────────────────────────────────────────────────────

function TimelineRow({
  entry,
  episodes,
  globalMinIdx,
  pxPerMonth,
  onMarkerClick,
  onStickerClick,
  activeMarker,
  setActiveMarker,
}: {
  entry: TimelineEntry;
  episodes: Episode[];
  globalMinIdx: number;
  pxPerMonth: number;
  onMarkerClick: (key: string, state: TooltipState) => void;
  onStickerClick: (ep: Episode) => void;
  activeMarker: string | null;
  setActiveMarker: (k: string | null) => void;
}) {
  const relatedEps = useMemo(
    () =>
      entry.episode_ids
        .map((id) => episodes.find((e) => e.id === id))
        .filter(Boolean) as Episode[],
    [entry.episode_ids, episodes]
  );

  const primaryEp = relatedEps[0];
  const category = primaryEp?.category ?? "";
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["_default"];

  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  const firstMonthIdx = monthIndex(entry.timestamps[0].month);
  const lastMonthIdx = monthIndex(entry.timestamps[entry.timestamps.length - 1].month);

  const startX = (firstMonthIdx - globalMinIdx) * pxPerMonth;
  const endX = (lastMonthIdx - globalMinIdx) * pxPerMonth;
  const lineWidth = endX - startX;

  return (
    <div className="flex" style={{ height: ROW_HEIGHT }}>
      {/* ── Sticky left panel ── */}
      <div
        className="sticky left-0 z-10 flex flex-col items-center justify-center gap-1.5 shrink-0 border-r"
        style={{
          width: LEFT_PANEL_W,
          background: "rgb(9,9,11)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        {/* Episode stickers */}
        <div className="flex gap-1 items-center">
          {relatedEps.slice(0, 4).map((ep) => (
            <button
              key={ep.id}
              onClick={() => onStickerClick(ep)}
              className="relative w-9 h-9 rounded-lg overflow-hidden border transition-all cursor-pointer hover:scale-110 hover:border-opacity-100"
              style={{ borderColor: colors.ring + "80", background: colors.bg }}
              title={ep.episode}
            >
              {ep.sticker && (
                <img
                  src={ep.sticker}
                  alt={ep.episode}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              )}
            </button>
          ))}
          {relatedEps.length > 4 && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold border"
              style={{ color: colors.ring, borderColor: colors.ring + "44" }}
            >
              +{relatedEps.length - 4}
            </div>
          )}
        </div>

        {/* Company name */}
        <span
          className="text-[11px] font-semibold text-center leading-tight px-2"
          style={{ color: colors.ring, maxWidth: LEFT_PANEL_W - 16 }}
        >
          {entry.company}
        </span>
      </div>

      {/* ── Timeline track ── */}
      <div className="relative flex-1">
        {/* Subtle row separator */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />

        {/* Horizontal line: startX → endX + fade */}
        {lineWidth > 0 && (
          <div
            className="absolute"
            style={{
              top: LINE_Y - 1,
              left: startX,
              width: lineWidth + FADE_PX,
              height: 2,
              background: `linear-gradient(to right, ${colors.ring}cc ${((lineWidth / (lineWidth + FADE_PX)) * 100).toFixed(1)}%, transparent 100%)`,
            }}
          />
        )}

        {/* Dot at the very start */}
        <div
          className="absolute rounded-full"
          style={{
            top: LINE_Y - 3,
            left: startX - 3,
            width: 8,
            height: 8,
            background: colors.ring,
            boxShadow: `0 0 8px 2px ${colors.ring}55`,
          }}
        />

        {/* Timestamp markers */}
        {entry.timestamps.map((ts, i) => {
          const x = (monthIndex(ts.month) - globalMinIdx) * pxPerMonth;
          const key = `${entry.company}__${i}`;
          const isActive = activeMarker === key;
          const isHovered = hoveredMarker === key;
          const isPopOut = isActive || isHovered;
          const emoji = parseEmoji(ts.emoji);

          return (
            <div
              key={key}
              className="absolute flex flex-col items-center"
              style={{
                left: x,
                top: LINE_Y - 14,
                transform: "translateX(-50%)",
                width: 90,
              }}
            >
              {/* Emoji button */}
              <button
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition-all cursor-pointer relative z-10 select-none"
                style={{
                  borderColor: isPopOut ? colors.ring : colors.ring + "99",
                  background: "rgb(9,9,11)",
                  boxShadow: isPopOut ? `0 0 12px 3px ${colors.ring}55` : "none",
                  transform: isPopOut ? "scale(1.25)" : "scale(1)",
                  fontSize: "0.85rem",
                }}
                onMouseEnter={() => setHoveredMarker(key)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) {
                    setActiveMarker(null);
                    return;
                  }
                  const rect = e.currentTarget.getBoundingClientRect();
                  onMarkerClick(key, {
                    anchorX: rect.left + rect.width / 2,
                    anchorY: rect.top,
                    month: ts.month,
                    title: ts.title,
                    description: ts.description,
                    color: colors.ring,
                  });
                  setActiveMarker(key);
                }}
                title={ts.title}
                aria-label={ts.title}
              >
                {emoji}
              </button>

              {/* Title */}
              <span
                className="mt-1 text-[9px] leading-tight text-zinc-500 text-center block"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxWidth: 88,
                  lineHeight: "1.3",
                } as React.CSSProperties}
              >
                {ts.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Year axis row ─────────────────────────────────────────────────────────────

function YearAxis({
  globalMinIdx,
  totalMonths,
  pxPerMonth,
}: {
  globalMinIdx: number;
  totalMonths: number;
  pxPerMonth: number;
}) {
  const ticks: { x: number; label: string }[] = [];
  for (let i = 0; i < totalMonths; i++) {
    const absIdx = globalMinIdx + i;
    const month = (absIdx % 12) + 1;
    if (month === 1) {
      const year = Math.floor(absIdx / 12);
      ticks.push({ x: i * pxPerMonth, label: String(year) });
    }
  }

  return (
    <div
      className="sticky left-0 flex shrink-0"
      style={{ height: 32, zIndex: 20 }}
    >
      {/* Filler for the left panel */}
      <div
        className="sticky left-0 shrink-0 border-r border-b flex items-end pb-1 z-20"
        style={{
          width: LEFT_PANEL_W,
          background: "rgb(9,9,11)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600 pl-3">
          Company
        </span>
      </div>

      {/* Year labels */}
      <div
        className="relative border-b"
        style={{
          width: totalMonths * pxPerMonth,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {ticks.map(({ x, label }) => (
          <div
            key={label}
            className="absolute flex flex-col items-center"
            style={{ left: x, bottom: 0, transform: "translateX(-50%)" }}
          >
            <div
              className="h-2 w-px mb-1"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
            <span className="text-[9px] font-medium text-zinc-600 whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChroniclesPage() {
  const [panelEpisode, setPanelEpisode] = useState<Episode | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [pxPerMonth, setPxPerMonth] = useState(DEFAULT_PX_PER_MONTH);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Stores the fractional month (offset from globalMinIdx) that was at the
  // viewport's horizontal center just before a zoom, so we can restore it after.
  const zoomAnchorRef = useRef<{ monthOffset: number; viewportCenter: number } | null>(null);

  const zoom = useCallback((delta: number) => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const viewportCenter = el.clientWidth / 2;
      const contentCenterX = el.scrollLeft + viewportCenter - LEFT_PANEL_W;
      zoomAnchorRef.current = {
        monthOffset: contentCenterX / pxPerMonth,
        viewportCenter,
      };
    }
    setPxPerMonth((prev) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev + delta)));
  }, [pxPerMonth]);

  const episodes = episodesData as Episode[];

  // ── Sort entries by max episode_id descending ──
  const sortedEntries = useMemo((): TimelineEntry[] => {
    return [...(timelineData as TimelineEntry[])].sort((a, b) => {
      const maxA = Math.max(...a.episode_ids);
      const maxB = Math.max(...b.episode_ids);
      return maxB - maxA;
    });
  }, []);

  // ── Global date range ──
  const { globalMinIdx, totalMonths } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const entry of sortedEntries) {
      for (const ts of entry.timestamps) {
        const idx = monthIndex(ts.month);
        if (idx < min) min = idx;
        if (idx > max) max = idx;
      }
    }
    const paddedMin = min - PAD_MONTHS_BEFORE;
    const paddedMax = max + PAD_MONTHS_AFTER;
    return {
      globalMinIdx: paddedMin,
      totalMonths: paddedMax - paddedMin + 1,
    };
  }, [sortedEntries]);

  const totalWidth = totalMonths * pxPerMonth;

  // ── Scroll to current date on mount ──
  useEffect(() => {
    if (!scrollRef.current) return;
    const now = new Date();
    const currentMonthIdx = now.getFullYear() * 12 + now.getMonth();
    const offsetMonths = currentMonthIdx - globalMinIdx;
    const el = scrollRef.current;
    const viewportWidth = el.clientWidth;
    el.scrollLeft =
      LEFT_PANEL_W +
      offsetMonths * DEFAULT_PX_PER_MONTH -
      (viewportWidth - LEFT_PANEL_W) / 2;
  }, [globalMinIdx]);

  // ── Restore scroll position after zoom ──
  useEffect(() => {
    if (!scrollRef.current || !zoomAnchorRef.current) return;
    const el = scrollRef.current;
    const { monthOffset, viewportCenter } = zoomAnchorRef.current;
    el.scrollLeft = monthOffset * pxPerMonth + LEFT_PANEL_W - viewportCenter;
    zoomAnchorRef.current = null;
  }, [pxPerMonth]);

  // ── Dismiss tooltip on outside click ──
  useEffect(() => {
    const handler = () => {
      setTooltip(null);
      setActiveMarker(null);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleMarkerClick = useCallback((key: string, state: TooltipState) => {
    setTooltip(state);
  }, []);

  const handleSetActiveMarker = useCallback((k: string | null) => {
    setActiveMarker(k);
    if (!k) setTooltip(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* ── Header ── */}
      <header className="py-2 px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 shadow shrink-0">
        <span className="text-xl font-bold tracking-tight" style={{ color: "#39F9CD" }}>
          The Acquired Universe
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded text-sm font-medium text-zinc-400 hover:text-white transition"
          >
            Map View
          </Link>
          <Link
            href="/graph"
            className="px-3 py-1.5 rounded text-sm font-medium text-zinc-400 hover:text-white transition"
          >
            Constellation View
          </Link>
          <Link
            href="/chronicles"
            className="px-3 py-1.5 rounded text-sm font-semibold text-black transition"
            style={{ backgroundColor: "#39F9CD" }}
          >
            Chronicles
          </Link>
          <span className="w-px h-5 bg-zinc-700" />
          <a
            href="https://github.com/pcwu2022/acquired_universe"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 6.8c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </nav>
      </header>

      {/* ── Intro blurb + zoom controls ── */}
      <div className="w-full px-6 pt-3 pb-2 flex items-center justify-between gap-4 shrink-0">
        <p className="text-sm text-zinc-400 leading-relaxed">
          The Chronicles — every pivotal chapter in the companies that shaped the{" "}
          <a
            href="https://www.acquired.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: "#39F9CD" }}
          >
            Acquired
          </a>{" "}
          universe. Click any marker to read its story.
        </p>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 shrink-0 bg-zinc-900 border border-zinc-700 rounded-lg px-1.5 py-1">
          <button
            className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition text-sm font-bold cursor-pointer disabled:opacity-30"
            onClick={() => zoom(-ZOOM_STEP)}
            disabled={pxPerMonth <= ZOOM_MIN}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-[10px] text-zinc-500 w-9 text-center tabular-nums select-none">
            {Math.round((pxPerMonth / DEFAULT_PX_PER_MONTH) * 100)}%
          </span>
          <button
            className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition text-sm font-bold cursor-pointer disabled:opacity-30"
            onClick={() => zoom(ZOOM_STEP)}
            disabled={pxPerMonth >= ZOOM_MAX}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Timeline container ── */}
      <style>{`
        .chronicles-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .chronicles-scroll::-webkit-scrollbar-track { background: rgb(9,9,11); }
        .chronicles-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .chronicles-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); }
        .chronicles-scroll::-webkit-scrollbar-corner { background: rgb(9,9,11); }
      `}</style>
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto relative chronicles-scroll"
        style={{ background: "rgb(9,9,11)" }}
        onClick={() => {
          setTooltip(null);
          setActiveMarker(null);
        }}
      >
        <div style={{ minWidth: LEFT_PANEL_W + totalWidth, display: "flex", flexDirection: "column" }}>
          {/* Year axis */}
          <YearAxis globalMinIdx={globalMinIdx} totalMonths={totalMonths} pxPerMonth={pxPerMonth} />

          {/* World Events row */}
          <WorldEventsRow
            events={worldEventsData as WorldEvent[]}
            globalMinIdx={globalMinIdx}
            totalMonths={totalMonths}
            pxPerMonth={pxPerMonth}
            onMarkerClick={handleMarkerClick}
            activeMarker={activeMarker}
            setActiveMarker={handleSetActiveMarker}
          />

          {/* Timeline rows */}
          {sortedEntries.map((entry) => (
            <TimelineRow
              key={entry.company}
              entry={entry}
              episodes={episodes}
              globalMinIdx={globalMinIdx}
              pxPerMonth={pxPerMonth}
              onMarkerClick={handleMarkerClick}
              onStickerClick={(ep) => setPanelEpisode(ep)}
              activeMarker={activeMarker}
              setActiveMarker={handleSetActiveMarker}
            />
          ))}

          {/* Bottom padding */}
          <div style={{ height: 32 }} />
        </div>
      </div>

      {/* ── Footer ── */}
      <PageFooter page="chronicles" />

      {/* ── Tooltip ── */}
      <Tooltip state={tooltip} />

      {/* ── Episode side panel ── */}
      <SidePanel episode={panelEpisode} onClose={() => setPanelEpisode(null)} />
    </div>
  );
}
