"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ListenerCircleProps = {
  x: number;
  y: number;
  count: number;
  city: string;
  scaleFactor?: number;
  showTooltip?: boolean;
  isUserCity?: boolean;
};

export default function ListenerCircle({
  x, y, count, city, scaleFactor = 4, showTooltip = false, isUserCity = false,
}: ListenerCircleProps) {
  const radius = Math.sqrt(count) * scaleFactor;
  const [hovered, setHovered] = useState(false);

  // User city uses gold; regular cities use teal
  const baseColor = isUserCity ? "251,191,36" : "57,249,205";

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
        pointerEvents: showTooltip || isUserCity ? "auto" : "none",
        zIndex: hovered ? 20 : isUserCity ? 5 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulse ring for user city */}
      {isUserCity && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `1.5px solid rgba(${baseColor},0.6)` }}
          animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div
        className="w-full h-full rounded-full listener-circle"
        style={{
          backgroundColor: `rgba(${baseColor},${isUserCity ? 0.35 : 0.25})`,
          border: `${isUserCity ? 1.5 : 1}px solid rgba(${baseColor},${hovered ? 1 : 0.7})`,
          boxShadow: hovered
            ? `0 0 18px 6px rgba(${baseColor},0.5)`
            : `0 0 ${isUserCity ? 14 : 10}px ${isUserCity ? 4 : 2}px rgba(${baseColor},${isUserCity ? 0.35 : 0.2})`,
          cursor: showTooltip || isUserCity ? "pointer" : "default",
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: hovered ? 1 : 0.7, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (showTooltip || isUserCity) && (
          <motion.div
            className="absolute bottom-[110%] left-1/2 -translate-x-1/2 pointer-events-none z-30 whitespace-nowrap"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="bg-zinc-900/95 backdrop-blur rounded-lg shadow-xl px-3 py-2 text-sm border"
              style={{ borderColor: isUserCity ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.1)" }}
            >
              {isUserCity ? (
                <>
                  <div className="font-bold" style={{ color: "rgb(251,191,36)" }}>That’s me. 👋</div>
                  <div className="text-zinc-300 text-xs mt-0.5">{city}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    {count.toLocaleString()} listener{count !== 1 ? "s" : ""} in this chapter
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-white">{city}</div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: "#39F9CD" }}>
                    {count.toLocaleString()} listener{count !== 1 ? "s" : ""}
                  </div>
                </>
              )}
            </div>
            <div
              className="w-2 h-2 mx-auto -mt-1 rotate-45 border-b border-r"
              style={{
                backgroundColor: "rgb(24 24 27 / 0.95)",
                borderColor: isUserCity ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.1)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
