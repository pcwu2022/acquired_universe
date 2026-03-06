"use client";
import React, { useState, useMemo } from "react";
import type { SurveyQuestion, SurveyAnswers } from "./questions";
import episodesData from "../../../data/episodes.json";

interface QuestionRendererProps {
  question: SurveyQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export default function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const [episodeQuery, setEpisodeQuery] = useState("");

  const episodeOptions = useMemo(() => {
    if (question.type !== "episode-search") return [];
    const q = episodeQuery.toLowerCase();
    const all = episodesData as { company: string; release_date: string }[];
    if (!q) return all.slice(0, 8);
    return all.filter((e: { company: string }) => e.episode.toLowerCase().includes(q)).slice(0, 8);
  }, [question.type, episodeQuery]);

  if (question.type === "text") {
    return (
      <textarea
        className="w-full rounded-lg px-4 py-3 text-sm resize-none outline-none transition focus:ring-2"
        rows={question.id === "message" ? 3 : 1}
        placeholder={question.placeholder}
        value={value as string}
        onChange={e => onChange(e.target.value)}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#e4e4e7",
        }}
      />
    );
  }

  if (question.type === "episode-search") {
    return (
      <div className="relative">
        <input
          type="text"
            className="w-full rounded-lg px-4 py-3 text-sm outline-none transition"
          placeholder={question.placeholder}
          value={episodeQuery || (value as string)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEpisodeQuery(e.target.value);
            onChange("");
          }}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e4e4e7",
          }}
        />
        {episodeQuery && episodeOptions.length > 0 && (
          <ul
            className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden shadow-lg"
            style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {episodeOptions.map(ep => (
              <li
                key={ep.episode}
                className="px-4 py-2 text-sm cursor-pointer transition hover:bg-white/10"
                style={{ color: "#e4e4e7" }}
                onClick={() => {
                  const ep2 = ep as { company: string; release_date: string };
                  onChange(ep2.episode);
                  setEpisodeQuery(ep2.episode);
                }}
              >
                <span className="font-medium">{ep.episode}</span>
                <span className="ml-2 text-xs text-zinc-500">{ep.release_date}</span>
              </li>
            ))}
          </ul>
        )}
        {value && !episodeQuery && (
          <p className="mt-1 text-xs" style={{ color: "#39F9CD" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "#39F9CD" }} />{value as string}
          </p>
        )}
      </div>
    );
  }

  if (question.type === "single") {
    return (
      <div className="flex flex-wrap gap-2">
        {question.options?.map(opt => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(selected ? "" : opt)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:scale-105"
              style={selected
                ? { background: "#39F9CD", color: "#000", borderColor: "#39F9CD" }
                : { background: "rgba(255,255,255,0.05)", color: "#a1a1aa", borderColor: "rgba(255,255,255,0.15)" }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "multi") {
    const selected = value as string[];
    return (
      <div className="flex flex-wrap gap-2">
        {question.options?.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                const next = isSelected ? selected.filter(v => v !== opt) : [...selected, opt];
                onChange(next);
              }}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:scale-105"
              style={isSelected
                ? { background: "rgba(57,249,205,0.2)", color: "#39F9CD", borderColor: "#39F9CD" }
                : { background: "rgba(255,255,255,0.05)", color: "#a1a1aa", borderColor: "rgba(255,255,255,0.15)" }
              }
            >
              {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "#000" }} />}
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}
