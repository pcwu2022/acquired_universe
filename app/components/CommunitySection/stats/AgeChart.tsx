"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { CommunityStats } from "../hooks/useCommunityStats";

const AGE_ORDER = ["<18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"];

interface AgeChartProps {
  stats: CommunityStats;
  highlightValue?: string;
}

export default function AgeChart({ stats, highlightValue }: AgeChartProps) {
  const data = AGE_ORDER.map(age => ({
    age,
    count: stats.age_group[age] || 0,
  }));

  return (
    <div>
      <h4 className="text-sm font-semibold text-zinc-300 mb-3">Age Distribution</h4>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <XAxis dataKey="age" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e4e4e7" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.age}
                fill={entry.age === highlightValue ? "#39F9CD" : "rgba(57,249,205,0.3)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {highlightValue && (
        <p className="text-xs mt-1" style={{ color: "#39F9CD" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "#39F9CD" }} />Your age group: {highlightValue}
        </p>
      )}
    </div>
  );
}
