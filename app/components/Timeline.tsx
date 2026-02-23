"use client";
import React from "react";

type TimelineProps = {
  timeline: string[]; // Array of YYYY-MM
  selected: string;
  onChange: (date: string) => void;
  disabled?: boolean;
};

export default function Timeline({ timeline, selected, onChange, disabled }: TimelineProps) {
  const idx = timeline.indexOf(selected);
  return (
    <div className="w-full flex flex-col items-center py-4">
      <input
        type="range"
        min={0}
        max={timeline.length - 1}
        value={idx}
        onChange={e => onChange(timeline[Number(e.target.value)])}
        className="w-3/4 accent-blue-500"
        disabled={disabled}
      />
      <div className="flex justify-between w-3/4 text-xs mt-2 text-gray-400">
        <span>{timeline[0]}</span>
        <span>{timeline[timeline.length - 1]}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-blue-400">{selected}</div>
    </div>
  );
}
