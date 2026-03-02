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
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {/* start label */}
      <span className="text-xs text-zinc-500 shrink-0">{timeline[0]}</span>

      {/* slider — accent colour set via CSS custom property in globals.css or inline */}
      <input
        type="range"
        min={0}
        max={timeline.length - 1}
        value={idx}
        onChange={e => onChange(timeline[Number(e.target.value)])}
        disabled={disabled}
        className="flex-1 h-1 appearance-none rounded-full cursor-pointer
          bg-zinc-700
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer"
        style={{
          // Filled track tint via background gradient trick
          background: `linear-gradient(to right, #39F9CD ${(idx / (timeline.length - 1)) * 100}%, #3f3f46 ${(idx / (timeline.length - 1)) * 100}%)`,
          // Thumb colour via CSS variable override isn't straightforward; handled by inline style on the element
        } as React.CSSProperties}
      />

      {/* end label */}
      <span className="text-xs text-zinc-500 shrink-0">{timeline[timeline.length - 1]}</span>

      {/* current date badge */}
      <span
        className="text-xs font-mono font-semibold px-2 py-0.5 rounded shrink-0"
        style={{ color: "#39F9CD", backgroundColor: "rgba(57,249,205,0.1)" }}
      >
        {selected}
      </span>
    </div>
  );
}
