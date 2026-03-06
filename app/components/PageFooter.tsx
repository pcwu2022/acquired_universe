"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { USE_DB } from "../utils/config";

type Props = {
  /** Identifier stored in the DB: "map" | "graph" | "chronicles" */
  page: string;
  /** Extra classes forwarded to the <footer> element */
  className?: string;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

export default function PageFooter({ page, className = "" }: Props) {
  const [totalViews, setTotalViews] = useState<number | null>(null);

  useEffect(() => {
    if (!USE_DB) return;
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) return;

    const SESSION_KEY = `pv_counted_${page}`;

    async function run() {
      // Only increment once per browser session
      if (!sessionStorage.getItem(SESSION_KEY)) {
        try {
          await fetch("/api/page-views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page }),
          });
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // silently fail — don't block the view count display
        }
      }

      // Fetch total
      try {
        const res = await fetch("/api/page-views");
        if (res.ok) {
          const data = await res.json();
          setTotalViews(data.total ?? null);
        }
      } catch {
        // silently fail
      }
    }

    run();
  }, [page]);

  return (
    <footer
      className={`py-8 text-center bg-zinc-900 border-t border-zinc-800 shrink-0 ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/acquired_universe.png"
          alt="The Acquired Universe"
          width={72}
          height={72}
          className="rounded-full"
          style={{ border: "2px solid rgba(57,249,205,0.25)" }}
        />
        <p className="text-zinc-500 text-xs tracking-widest uppercase">
          Created by{" "}
          <a
            href="https://pcwu2022.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition underline underline-offset-2"
          >
            Po-Chun Wu
          </a>{" "}
          🇹🇼
        </p>
        {totalViews !== null && (
          <p className="text-zinc-600 text-[11px] tracking-wider">
            <span className="text-zinc-400 font-semibold tabular-nums">
              {formatCount(totalViews)}
            </span>{" "}
            visits across the universe
          </p>
        )}
      </div>
    </footer>
  );
}
