// EpisodeMarker.tsx

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Episode } from "../../types/data";
import { CATEGORY_COLORS } from "../utils/categories";

type EpisodeMarkerProps = {
  episode: Episode;
  isSelected: boolean;
  onClick: () => void;
  scale: number; // 1 = normal, >1 = recently aired
  x: number;
  y: number;
  isNewest?: boolean;      // newest in current filtered view → pulsing ring
  isGlobalLatest?: boolean; // last episode in the full dataset → LATEST EP badge
};

const FALLBACK_STICKER =
  "acquired_universe.png";

export default function EpisodeMarker({ episode, isSelected, onClick, scale, x, y, isNewest, isGlobalLatest }: EpisodeMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = CATEGORY_COLORS[episode.category] ?? CATEGORY_COLORS["_default"];
  const finalScale = scale * (isHovered ? 1.3 : 1);

  return (
    <motion.div
      className="absolute cursor-pointer pointer-events-auto"
      // Position is set directly (not animated) so markers track the map perfectly during drag
      style={{
        left: x,
        top: y,
        width: 32,
        height: 32,
        marginLeft: -16,
        marginTop: -16,
        zIndex: isSelected ? 10 : isHovered ? 9 : (isNewest || isGlobalLatest) ? 8 : 1,
      }}
      // initial fires only when this marker first mounts (new episode appears on the timeline).
      // Existing markers never re-mount because MapOverlayContent is defined at module scope.
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: finalScale }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Newest episode: pulsing ring */}
      {isNewest && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: "2px solid #facc15" }}
          animate={{ scale: [1, 1.7, 1], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Global latest episode: persistent callout label */}
      {isGlobalLatest && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            zIndex: 30,
          }}
        >
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-lg"
            style={{
              background: "linear-gradient(90deg, #facc15, #f97316)",
              color: "#000",
              boxShadow: "0 0 8px 2px rgba(250,204,21,0.5)",
            }}
          >
            <span>★</span>
            <span>LATEST EP</span>
          </div>
          {/* Arrow */}
          <div
            className="w-2 h-2 mx-auto -mt-px rotate-45"
            style={{ background: "#f97316" }}
          />
        </div>
      )}

      {/* Marker circle */}
      <div
        className="w-full h-full rounded-full shadow-lg border-2 flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: colors.bg,
          borderColor: isSelected ? "#60a5fa" : colors.ring,
          boxShadow: isHovered
            ? `0 0 0 3px ${colors.ring}55, 0 0 12px 4px ${colors.ring}33`
            : `0 0 8px 2px ${colors.ring}33`,
        }}
      >
        <img
          src={episode.sticker || FALLBACK_STICKER}
          alt={episode.episode}
          className="w-full h-full object-contain p-1"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_STICKER;
          }}
        />
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-[110%] left-1/2 -translate-x-1/2 pointer-events-none z-20"
            style={{ width: "max-content", maxWidth: 140 }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-zinc-900/95 backdrop-blur rounded-lg shadow-xl px-3 py-2 text-xs border border-white/10">
              <div
                className="font-bold text-white leading-snug"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >{episode.episode}</div>
              <div className="text-zinc-500 mt-0.5">{episode.release_date}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: colors.ring }}
                />
                <span className="text-zinc-400 text-xs">{episode.category}</span>
              </div>
            </div>
            {/* Arrow */}
            <div
              className="w-2 h-2 mx-auto -mt-1 rotate-45 border-b border-r border-white/10"
              style={{ backgroundColor: "rgb(24 24 27 / 0.95)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
