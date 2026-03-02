"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { CommunityStats } from "../hooks/useCommunityStats";

interface IndustryChartProps {
  stats: CommunityStats;
  highlightValue?: string;
}

export default function IndustryChart({ stats, highlightValue }: IndustryChartProps) {
  const data = Object.entries(stats.industry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  return (
    <div>
      <h4 className="text-sm font-semibold text-zinc-300 mb-3">Industry Breakdown</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        >
          <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e4e4e7" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.name}
                fill={entry.name === highlightValue ? "#39F9CD" : "rgba(57,249,205,0.3)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {highlightValue && (
        <p className="text-xs mt-1" style={{ color: "#39F9CD" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "#39F9CD" }} />Your industry: {highlightValue}
        </p>
      )}
    </div>
  );
}
