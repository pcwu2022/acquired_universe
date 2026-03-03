// HostMarker.tsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export type Host = {
  id: "ben" | "david";
  name: string;
  color: string;          // ring / glow colour
  image: string;          // sticker URL
};

export const HOSTS: Record<"ben" | "david", Host> = {
  ben: {
    id: "ben",
    name: "Ben",
    color: "#f59e0b",
    image: "https://media.licdn.com/dms/image/v2/D5603AQFtODVTQQKSAQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1701719488034?e=1773878400&v=beta&t=aFPhW3-QzKSf0afVjCTpFga61PM71dpeO1Cyn48IIxU",
  },
  david: {
    id: "david",
    name: "David",
    color: "#14b8a6",
    image: "https://media.licdn.com/dms/image/v2/D5603AQFZPPyX6-XUYA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1726240203458?e=1773878400&v=beta&t=bmTfcS1l4hFC7FTZRxHicZULlGBBh9j1xlqiVW5aJxw",
  },
};

type HostMarkerProps = {
  host: Host;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
};

const SIZE = 44;

export default function HostMarker({ host, x, y, isSelected, onClick }: HostMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute cursor-pointer pointer-events-auto"
      style={{
        left: x,
        top: y,
        width: SIZE,
        height: SIZE,
        marginLeft: -SIZE / 2,
        marginTop: -SIZE / 2,
        zIndex: isSelected ? 50 : isHovered ? 45 : 40,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: isHovered ? 1.15 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection ring */}
      {isSelected && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -4,
            border: `3px solid ${host.color}`,
            borderRadius: "50%",
          }}
        />
      )}

      {/* Main circle — opaque, image fills entirely */}
      <div
        className="w-full h-full rounded-full overflow-hidden"
        style={{
          border: `3px solid ${host.color}`,
          boxShadow: isHovered
            ? `0 0 0 4px ${host.color}55, 0 0 18px 6px ${host.color}44`
            : `0 0 10px 3px ${host.color}44`,
          backgroundImage: `url(${host.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#1a1a1a",
        }}
      />

      {/* Mic badge (top-right) */}
      <div
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black leading-none shadow-lg"
        style={{ background: host.color, color: "#000" }}
      >
        🎙
      </div>

      {/* Always-visible name label */}
      <div
        className="absolute left-1/2 pointer-events-none"
        style={{
          top: "calc(100% + 5px)",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          zIndex: 50,
        }}
      >
        <div
          className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide"
          style={{
            background: host.color,
            color: "#000",
            boxShadow: `0 1px 6px ${host.color}66`,
          }}
        >
          {host.name}
        </div>
      </div>
    </motion.div>
  );
}
