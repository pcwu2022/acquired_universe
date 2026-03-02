"use client";
import React, { useState } from "react";
import type { CommunityStats } from "../hooks/useCommunityStats";

interface TextQuoteCardsProps {
  stats: CommunityStats;
}

export default function TextQuoteCards({ stats }: TextQuoteCardsProps) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 4;
  const messages = stats.messages;
  const totalPages = Math.ceil(messages.length / PAGE_SIZE);
  const visible = messages.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500 text-sm italic">No messages yet. Be the first to share yours!</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-zinc-300 mb-4">Community Voice</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((msg, i) => (
          <div
            key={i}
            className="rounded-xl p-4 text-sm italic"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#d4d4d8" }}
          >
            &ldquo;{msg}&rdquo;
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs px-3 py-1 rounded transition disabled:opacity-30"
            style={{ color: "#a1a1aa" }}
          >
            ‹ Prev
          </button>
          <span className="text-xs text-zinc-500 self-center">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-xs px-3 py-1 rounded transition disabled:opacity-30"
            style={{ color: "#a1a1aa" }}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
