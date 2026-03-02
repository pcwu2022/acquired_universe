"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { CommunityStats } from "../hooks/useCommunityStats";
import type { SurveyAnswers } from "../survey/questions";
import AgeChart from "./AgeChart";
import IndustryChart from "./IndustryChart";
import PlatformChart from "./PlatformChart";
import TextQuoteCards from "./TextQuoteCards";

const GENDER_COLORS = ["#39F9CD", "#f472b6", "#a78bfa", "#71717a"];
const DISCOVERY_COLORS = ["#39F9CD", "#fbbf24", "#60a5fa", "#f472b6", "#a78bfa", "#34d399", "#f97316"];

interface StatsDashboardProps {
  stats: CommunityStats;
  userAnswers?: SurveyAnswers;
}

function topKey(record: Record<string, number>): string {
  return Object.entries(record).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

function pct(n: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

export default function StatsDashboard({ stats, userAnswers }: StatsDashboardProps) {
  const genderData = Object.entries(stats.gender).map(([name, value]) => ({ name, value }));
  const discoveryData = Object.entries(stats.discovery)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const powerListeners = stats.frequency["Every episode"] || 0;
  const topPlatform = topKey(stats.platforms);
  const topDiscovery = topKey(stats.discovery);
  const topEpisode = stats.favorite_episodes[0]?.episode ?? "—";

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Responses", value: stats.total.toLocaleString() },
          { label: "Power Listeners", value: pct(powerListeners, stats.total) },
          { label: "Top Platform", value: topPlatform },
          { label: "Most Loved Episode", value: topEpisode },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Audience Profile */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <span className="w-0.5 h-4 rounded" style={{ background: "#39F9CD" }} />
          Audience Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <AgeChart stats={stats} highlightValue={userAnswers?.age_group} />
          </div>
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <IndustryChart stats={stats} highlightValue={userAnswers?.industry} />
          </div>
          {genderData.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Gender Distribution</h4>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" cx={55} cy={55} innerRadius={28} outerRadius={50} paddingAngle={3}>
                      {genderData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={entry.name === userAnswers?.gender ? "#39F9CD" : GENDER_COLORS[i % GENDER_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e4e4e7" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="space-y-1.5">
                  {genderData.map((entry, i) => (
                    <li key={entry.name} className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="w-2 h-2 rounded-full" style={{ background: GENDER_COLORS[i % GENDER_COLORS.length] }} />
                      {entry.name} — {pct(entry.value, stats.total)}
                    </li>
                  ))}
                </ul>
              </div>
              {userAnswers?.gender && (
                <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "#39F9CD" }}><span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#39F9CD" }} />Your gender: {userAnswers.gender}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Listening Behavior */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <span className="w-0.5 h-4 rounded" style={{ background: "#fbbf24" }} />
          Listening Behavior
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Listening Frequency</h4>
            <div className="space-y-2">
              {Object.entries(stats.frequency)
                .sort((a, b) => b[1] - a[1])
                .map(([key, val]) => {
                  const width = stats.total ? (val / stats.total) * 100 : 0;
                  const isUser = userAnswers?.frequency === key;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={isUser ? "font-semibold flex items-center gap-1.5" : "text-zinc-400"} style={isUser ? { color: "#39F9CD" } : {}}>
                          {isUser && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#39F9CD" }} />}{key}
                        </span>
                        <span className="text-zinc-500">{pct(val, stats.total)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${width}%`, background: isUser ? "#39F9CD" : "rgba(57,249,205,0.35)" }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <PlatformChart stats={stats} highlightValues={userAnswers?.platforms} />
          </div>
        </div>
      </div>

      {/* Discovery */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <span className="w-0.5 h-4 rounded" style={{ background: "#60a5fa" }} />
          How People Discovered Acquired
        </h3>
        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="space-y-2">
            {discoveryData.map((entry, i) => {
              const width = stats.total ? (entry.value / stats.total) * 100 : 0;
              const isUser = userAnswers?.discovery === entry.name;
              return (
                <div key={entry.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isUser ? "font-semibold flex items-center gap-1.5" : "text-zinc-400"} style={isUser ? { color: "#39F9CD" } : {}}>
                      {isUser && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#39F9CD" }} />}{entry.name}
                    </span>
                    <span className="text-zinc-500">{pct(entry.value, stats.total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${width}%`, background: DISCOVERY_COLORS[i % DISCOVERY_COLORS.length] + "88" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-zinc-600 mt-3">Top source: <span className="text-zinc-400">{topDiscovery}</span></p>
        </div>
      </div>

      {/* Content Affinity */}
      {stats.favorite_episodes.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
            <span className="w-0.5 h-4 rounded" style={{ background: "#f472b6" }} />
            Most Loved Episodes
          </h3>
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <ol className="space-y-2">
              {stats.favorite_episodes.map((ep, i) => {
                const isUser = userAnswers?.favorite_episode === ep.episode;
                return (
                  <li key={ep.episode} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : "rgba(255,255,255,0.08)",
                        color: i < 3 ? "#000" : "#71717a",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={isUser ? "text-sm flex items-center gap-1.5" : "text-sm"}
                      style={isUser ? { color: "#39F9CD", fontWeight: 600 } : { color: "#d4d4d8" }}
                    >
                      {isUser && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#39F9CD" }} />}{ep.episode}
                    </span>
                    <span className="ml-auto text-xs text-zinc-600">{ep.count} vote{ep.count !== 1 ? "s" : ""}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      {/* Community Voice */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <span className="w-0.5 h-4 rounded" style={{ background: "#a78bfa" }} />
          Community Voice
        </h3>
        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <TextQuoteCards stats={stats} />
        </div>
      </div>
    </div>
  );
}
