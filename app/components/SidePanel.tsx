"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Episode } from "../../types/data";
import { CATEGORY_COLORS } from "../utils/categories";

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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 shadow-2xl z-50 flex flex-col overflow-y-auto border-l border-white/10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close button — floating over the cover */}
            <button
              className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition text-sm cursor-pointer"
              onClick={onClose}
              title="Close"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Cover image — 16:9, flush to all three edges */}
            <div
              className="w-full shrink-0 relative"
              style={{ aspectRatio: "16/9", background: (CATEGORY_COLORS[episode.category] ?? CATEGORY_COLORS["_default"]).bg }}
            >
              <img
                src={episode.sticker}
                alt={episode.company}
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
            </div>

            {/* Content body */}
            <div className="flex flex-col gap-3 px-6 pt-5 pb-8">
              {/* Title */}
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {episode.company}
              </h2>

              {/* Meta: release date + category */}
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>{episode.release_date}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span
                  className="font-medium"
                  style={{ color: (CATEGORY_COLORS[episode.category] ?? CATEGORY_COLORS["_default"]).ring }}
                >
                  {episode.category}
                </span>
              </div>

              {/* Episode button */}
              <a
                href={episode.episode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 active:scale-95 cursor-pointer"
                title="Open episode page"
                style={{ background: "#39F9CD", color: "#000" }}
              >
                View the Episode
              </a>

              {/* Description */}
              <p className="text-sm text-zinc-300 leading-relaxed mt-1">
                {episode.description.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < episode.description.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
