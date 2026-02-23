"use client";
import React from "react";
import { motion } from "framer-motion";
import type { Episode } from "../../../types/data";

type EpisodeMarkerProps = {
  episode: Episode;
  isSelected: boolean;
  onClick: () => void;
  scale: number; // 1 = normal, >1 = larger
};

export default function EpisodeMarker({ episode, isSelected, onClick, scale }: EpisodeMarkerProps) {
  return (
    <motion.div
      className={`absolute episode-marker rounded-full shadow-lg border-2 ${isSelected ? "border-blue-400" : "border-white"} cursor-pointer bg-blue-500/80`}
      style={{
        left: `calc(${episode.hq.lng}% - 16px)`, // Placeholder: replace with projection
        top: `calc(${episode.hq.lat}% - 16px)`, // Placeholder: replace with projection
        width: 32 * scale,
        height: 32 * scale,
        zIndex: isSelected ? 10 : 1,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      <span className="block w-full h-full flex items-center justify-center text-xs text-white font-bold">
        {episode.company[0]}
      </span>
    </motion.div>
  );
}
