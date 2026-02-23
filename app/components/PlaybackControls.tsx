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
    <div className="flex items-center gap-4 py-2">
      {isPlaying ? (
        <button onClick={onPause} className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
          <FaPause />
        </button>
      ) : (
        <button onClick={onPlay} className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
          <FaPlay />
        </button>
      )}
      {showReset && onReset && (
        <button onClick={onReset} className="p-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition">
          <FaUndo />
        </button>
      )}
    </div>
  );
}
