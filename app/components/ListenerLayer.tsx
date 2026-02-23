"use client";
import React from "react";
import { motion } from "framer-motion";

type ListenerCircleProps = {
  lat: number;
  lng: number;
  count: number;
  scaleFactor?: number;
};

export default function ListenerCircle({ lat, lng, count, scaleFactor = 4 }: ListenerCircleProps) {
  // Placeholder: replace with projection
  const left = `calc(${lng}% - 12px)`;
  const top = `calc(${lat}% - 12px)`;
  const radius = Math.sqrt(count) * scaleFactor;
  return (
    <motion.div
      className="absolute listener-circle rounded-full bg-pink-500/60 border border-pink-300 shadow-lg pointer-events-none"
      style={{
        left,
        top,
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 0.7, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    />
  );
}
