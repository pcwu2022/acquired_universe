// HostPanel.tsx
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Host } from "./HostMarker";

type HostPanelProps = {
  host: Host | null;
  onClose: () => void;
};

const HOST_BIO: Record<string, {
  full_name: string;
  title: string;
  bio: string[];
  links: { label: string; url: string }[];
  fun_fact: string;
}> = {
  ben: {
    full_name: "Ben Gilbert",
    title: "Co-host & Managing Director",
    bio: [
      "Ben Gilbert is the co-founder and co-host of Acquired, a podcast that tells the stories behind the world's greatest technology companies and their products.",
      "Outside of Acquired, Ben is a Managing Director at Pioneer Square Labs (PSL) in Seattle, where he helps found and fund technology companies across the Pacific Northwest.",
      "Ben grew up in Seattle and has spent most of his career in the Pacific Northwest tech ecosystem, giving him a front-row seat to Amazon, Microsoft, and the broader cloud computing revolution.",
    ],
    links: [
      { label: "Acquired.fm", url: "https://www.acquired.fm" },
      { label: "Pioneer Square Labs", url: "https://www.psl.com" },
    ],
    fun_fact: "Ben once spent an entire episode recording session explaining why the Sonos speaker was a greater technological achievement than the iPhone.",
  },
  david: {
    full_name: "David Rosenthal",
    title: "Co-host & General Partner",
    bio: [
      "David Rosenthal is the co-founder and co-host of Acquired, the podcast dedicated to telling the stories of the greatest technology and business empires.",
      "David is a General Partner at Wave Capital, a San Francisco-based venture capital firm focused on early-stage infrastructure and developer tools.",
      "Based in San Francisco, David brings a deep operator and investor lens to every episode, dissecting the strategic decisions that transformed startups into generational companies.",
    ],
    links: [
      { label: "Acquired.fm", url: "https://www.acquired.fm" },
      { label: "Wave Capital", url: "https://www.wave.capital" },
    ],
    fun_fact: "David is known for his encyclopedic knowledge of the semiconductor industry and can recite the full history of ARM Holdings from memory.",
  },
};

export default function HostPanel({ host, onClose }: HostPanelProps) {
  const data = host ? HOST_BIO[host.id] : null;

  return (
    <AnimatePresence>
      {host && data && (
        <>
          {/* Dimmed backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 shadow-2xl z-50 flex flex-col overflow-y-auto border-l border-white/10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition text-sm cursor-pointer"
              onClick={onClose}
              title="Close"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Header banner */}
            <div
              className="w-full shrink-0 flex flex-col items-center justify-end pb-6 pt-10 relative"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${host.color}44 0%, transparent 70%), linear-gradient(180deg, #18181b 0%, #09090b 100%)`,
                minHeight: 200,
              }}
            >
              {/* Decorative top accent line */}
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${host.color}, transparent)` }}
              />

              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full overflow-hidden mb-4"
                style={{
                  border: `4px solid ${host.color}`,
                  boxShadow: `0 0 24px 6px ${host.color}55`,
                  backgroundImage: `url(${host.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "#1a1a1a",
                }}
              />

              {/* Name + title */}
              <h2 className="text-2xl font-bold text-white tracking-tight">{data.full_name}</h2>
              <p className="text-xs mt-1 font-semibold tracking-widest uppercase" style={{ color: host.color }}>
                {data.title}
              </p>

              {/* Co-host badge */}
              <div
                className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: `${host.color}22`, color: host.color, border: `1px solid ${host.color}44` }}
              >
                <span>🎙</span>
                <span>Acquired Co-Host</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 px-6 pt-5 pb-10">
              {/* Bio */}
              <div className="flex flex-col gap-2">
                {data.bio.map((paragraph, i) => (
                  <p key={i} className="text-sm text-zinc-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Fun fact */}
              <div
                className="rounded-xl px-4 py-3 text-sm text-zinc-300 leading-relaxed italic border"
                style={{
                  background: `${host.color}0f`,
                  borderColor: `${host.color}33`,
                }}
              >
                <span className="not-italic font-semibold" style={{ color: host.color }}>Fun fact: </span>
                {data.fun_fact}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2">
                {data.links.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 active:scale-95 cursor-pointer"
                    style={{ background: host.color, color: "#000" }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
