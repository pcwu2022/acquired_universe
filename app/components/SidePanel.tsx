"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Episode } from "../../types/data";

type SidePanelProps = {
  episode: Episode | null;
  onClose: () => void;
};

export default function SidePanel({ episode, onClose }: SidePanelProps) {
  return (
    <AnimatePresence>
      {episode && (
        <>
          {/* Dimmed background */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Glassmorphism panel */}
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white/30 dark:bg-zinc-900/60 backdrop-blur-lg shadow-2xl z-50 flex flex-col p-8 overflow-y-auto border-l border-white/20"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              className="self-end mb-4 px-3 py-1 rounded bg-zinc-800/60 text-white hover:bg-zinc-700/80 transition"
              onClick={onClose}
            >
              Close
            </button>
            <h2 className="text-2xl font-bold mb-2">{episode.company}</h2>
            <div className="text-sm text-zinc-300 mb-2">Released: {episode.release_date}</div>
            <div className="text-sm text-zinc-300 mb-2">Market Cap: ${episode.market_cap_at_release.toLocaleString()}</div>
            <p className="mb-4 text-zinc-100">{episode.description}</p>
            <a
              href={episode.episode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition mb-2"
            >
              Listen on Podcast
            </a>
            {/* Placeholder for key themes */}
            <div className="mt-4">
              <span className="text-xs text-zinc-400">Key Themes:</span>
              <ul className="list-disc ml-6 text-zinc-200">
                <li>Network Effects</li>
                <li>Regulatory Capture</li>
              </ul>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
