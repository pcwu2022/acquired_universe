"use client";
import React from "react";
import { FaPlay, FaPause, FaUndo } from "react-icons/fa";

type PlaybackControlsProps = {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset?: () => void;
  showReset?: boolean;
};

export default function PlaybackControls({ isPlaying, onPlay, onPause, onReset, showReset }: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {showReset && onReset && (
        <button
          onClick={onReset}
          title="Restart"
          className="p-1.5 rounded text-zinc-400 hover:text-white transition"
        >
          <FaUndo size={12} />
        </button>
      )}
      <button
        onClick={isPlaying ? onPause : onPlay}
        title={isPlaying ? "Pause" : "Play"}
        className="w-8 h-8 flex items-center justify-center rounded-full text-black transition hover:scale-110"
        style={{ backgroundColor: "#39F9CD" }}
      >
        {isPlaying ? <FaPause size={13} /> : <FaPlay size={13} className="ml-0.5" />}
      </button>
    </div>
  );
}
