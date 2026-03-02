"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { CommunityStats } from "../hooks/useCommunityStats";

interface PlatformChartProps {
  stats: CommunityStats;
  highlightValues?: string[];
}

export default function PlatformChart({ stats, highlightValues = [] }: PlatformChartProps) {
  const data = Object.entries(stats.platforms)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return (
    <div>
      <h4 className="text-sm font-semibold text-zinc-300 mb-3">Listening Platforms</h4>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e4e4e7" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.name}
                fill={highlightValues.includes(entry.name) ? "#39F9CD" : "rgba(57,249,205,0.3)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {highlightValues.length > 0 && (
        <p className="text-xs mt-1" style={{ color: "#39F9CD" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "#39F9CD" }} />Your platforms: {highlightValues.join(", ")}
        </p>
      )}
    </div>
  );
}
