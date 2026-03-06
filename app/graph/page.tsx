"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageFooter from "../components/PageFooter";
import { buildGraphData, type GraphNode, type GraphLink } from "../utils/graphData";
import type { Episode } from "../../types/data";
import { CATEGORY_COLORS } from "../utils/categories";

// Dynamic import to avoid SSR issues and A-Frame global dependency in full bundle
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#39F9CD] border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Loading graph…</p>
      </div>
    </div>
  ),
});

// ── Image cache for node rendering ──────────────────────────────────────────
const imgCache: Record<string, HTMLImageElement> = {};

function loadImage(url: string, onLoad: () => void): HTMLImageElement | null {
  if (!url) return null;
  if (imgCache[url]) {
    if (imgCache[url].complete) return imgCache[url];
    imgCache[url].addEventListener("load", onLoad, { once: true });
    return imgCache[url];
  }
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  imgCache[url] = img;
  img.addEventListener("load", onLoad, { once: true });
  return img;
}

// ── Node detail side panel ───────────────────────────────────────────────────
type Neighbour = { node: GraphNode; weight: number };

function NodePanel({
  node,
  graphData,
  onClose,
  onNavigate,
}: {
  node: GraphNode | null;
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  onClose: () => void;
  onNavigate: (node: GraphNode) => void;
}) {
  const episode = node?.episode as Episode | undefined;
  const catColors = episode
    ? (CATEGORY_COLORS[episode.category] ?? CATEGORY_COLORS["_default"])
    : CATEGORY_COLORS["_default"];

  // Build sorted neighbour list for the selected node
  const neighbours = useMemo((): Neighbour[] => {
    if (!node) return [];
    const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));
    const found = new Map<string, number>();
    for (const link of graphData.links) {
      const src = typeof link.source === "object" ? (link.source as any).id : link.source;
      const tgt = typeof link.target === "object" ? (link.target as any).id : link.target;
      if (src === node.id && nodeMap.has(tgt)) {
        found.set(tgt, (found.get(tgt) ?? 0) + link.weight);
      } else if (tgt === node.id && nodeMap.has(src)) {
        found.set(src, (found.get(src) ?? 0) + link.weight);
      }
    }
    return Array.from(found.entries())
      .map(([id, weight]) => ({ node: nodeMap.get(id)!, weight }))
      .sort((a, b) => b.weight - a.weight);
  }, [node, graphData]);

  const [showAll, setShowAll] = useState(false);
  const INITIAL_SHOW = 6;
  const visible = showAll ? neighbours : neighbours.slice(0, INITIAL_SHOW);

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 shadow-2xl z-50 flex flex-col overflow-y-auto border-l border-white/10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition text-sm cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Cover / sticker */}
            <div
              className="w-full shrink-0 relative"
              style={{
                aspectRatio: "16/9",
                background: catColors.bg,
              }}
            >
              {episode?.sticker ? (
                <img
                  src={episode.sticker}
                  alt={node.label}
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/20">{node.label[0]}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 px-6 pt-5 pb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {node.label}
              </h2>

              {episode && (
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{episode.release_date}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  <span className="font-medium" style={{ color: catColors.ring }}>
                    {episode.category}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 py-3 border-y border-zinc-800">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold" style={{ color: "#39F9CD" }}>
                    {node.degree}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Connections</span>
                </div>
              </div>

              {episode?.episode_url && (
                <a
                  href={episode.episode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: catColors.ring, color: "#000" }}
                >
                  Listen on Acquired →
                </a>
              )}

              {!episode && (
                <p className="text-zinc-500 text-sm italic">
                  No episode found for "{node.label}"
                </p>
              )}

              {/* ── Orbit section ── */}
              {neighbours.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                  {/* Section header */}
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      In Orbit
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                  </div>
                  <p className="text-[11px] text-zinc-600 -mt-1">
                    Companies most frequently mentioned alongside {node.label}
                  </p>

                  {/* Connection cards */}
                  <div className="flex flex-col gap-1.5">
                    {visible.map(({ node: n, weight }) => {
                      const nEp = n.episode;
                      const nCat = nEp
                        ? (CATEGORY_COLORS[nEp.category] ?? CATEGORY_COLORS["_default"])
                        : CATEGORY_COLORS["_default"];
                      return (
                        <button
                          key={n.id}
                          onClick={() => onNavigate(n)}
                          className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 transition cursor-pointer text-left group"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
                          }
                        >
                          {/* Sticker thumbnail */}
                          <div
                            className="w-10 h-10 rounded-lg shrink-0 overflow-hidden relative"
                            style={{ background: nCat.bg }}
                          >
                            {nEp?.sticker && (
                              <img
                                src={nEp.sticker}
                                alt={n.label}
                                className="absolute inset-0 w-full h-full object-cover"
                                draggable={false}
                              />
                            )}
                          </div>

                          {/* Name + category */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold text-white truncate group-hover:text-[#39F9CD] transition-colors">
                              {n.label}
                            </span>
                            {nEp && (
                              <span className="text-[11px] truncate" style={{ color: nCat.ring }}>
                                {nEp.category}
                              </span>
                            )}
                          </div>

                          {/* Weight badge */}
                          <div
                            className="shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold w-6 h-6"
                            style={{
                              background: `${node.color}22`,
                              color: node.color,
                              border: `1px solid ${node.color}44`,
                            }}
                          >
                            {weight}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Show more / less */}
                  {neighbours.length > INITIAL_SHOW && (
                    <button
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition self-center mt-0.5 cursor-pointer"
                      onClick={() => setShowAll((v) => !v)}
                    >
                      {showAll
                        ? "Show less ↑"
                        : `Show all ${neighbours.length} connections ↓`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Legend ───────────────────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { label: "Technology",    color: "#3b82f6" },
  { label: "Finance",       color: "#22c55e" },
  { label: "Gaming",        color: "#8b5cf6" },
  { label: "Retail",        color: "#f97316" },
  { label: "Media",         color: "#ec4899" },
  { label: "Entertainment", color: "#d946ef" },
  { label: "Semiconductors",color: "#a855f7" },
  { label: "Transportation",color: "#f43f5e" },
  { label: "Luxury",        color: "#fb923c" },
  { label: "Sports",        color: "#14b8a6" },
  { label: "Other",         color: "#6b7280" },
];

function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-lg p-3 text-xs text-zinc-400 flex flex-col gap-1.5 pointer-events-none">
      <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px] mb-0.5">Category</span>
      {LEGEND_ITEMS.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span>{label}</span>
        </div>
      ))}
      <div className="mt-1 pt-2 border-t border-zinc-700 text-[10px] text-zinc-500">
        Node size = number of connections
      </div>
    </div>
  );
}

// ── Main graph page ──────────────────────────────────────────────────────────
export default function GraphPage() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const forceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [, forceUpdate] = useState(0);

  const graphData = useMemo(() => buildGraphData(), []);

  // Track container dimensions
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Poll via rAF until ForceGraph2D's ref is populated (the dynamic import
  // may not have resolved when the first useEffect fires on cold load).
  // react-force-graph-2d only accepts MutableRefObject, so callback refs
  // can't be used — polling is the simplest reliable alternative.
  useEffect(() => {
    let raf: number;
    const apply = () => {
      if (forceRef.current) {
        forceRef.current.d3Force("charge")?.strength(-600);
        forceRef.current.d3Force("link")?.distance(350);
      } else {
        raf = requestAnimationFrame(apply);
      }
    };
    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      setHoverNode(node ?? null);
      if (!node) {
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        return;
      }
      const neighborIds = new Set<string>([node.id]);
      const linkKeys = new Set<string>();
      for (const link of graphData.links) {
        const src = typeof link.source === "object" ? (link.source as any).id : link.source;
        const tgt = typeof link.target === "object" ? (link.target as any).id : link.target;
        if (src === node.id || tgt === node.id) {
          neighborIds.add(src);
          neighborIds.add(tgt);
          linkKeys.add(`${src}|||${tgt}`);
        }
      }
      setHighlightNodes(neighborIds);
      setHighlightLinks(linkKeys);
    },
    [graphData.links]
  );

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  // Node canvas rendering: circular image with glow
  const nodeCanvasObject = useCallback(
    (nodeRaw: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = nodeRaw as GraphNode;
      const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
      const isHovered = hoverNode?.id === node.id;

      // Node radius proportional to degree
      const BASE = 6;
      const radius = BASE + Math.sqrt(node.degree) * 2.5;
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      ctx.save();
      ctx.globalAlpha = isHighlighted ? 1 : 0.25;

      if (isHovered) {
        // Glow ring
        const grd = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 2);
        grd.addColorStop(0, `${node.color}55`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Clip and draw image
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.clip();

      if (node.sticker) {
        const img = loadImage(node.sticker, () => forceUpdate((n) => n + 1));
        if (img && img.complete && img.naturalWidth > 0) {
          try {
            const diameter = radius * 2;
            const scale = Math.max(diameter / img.naturalWidth, diameter / img.naturalHeight);
            const sw = img.naturalWidth * scale;
            const sh = img.naturalHeight * scale;
            ctx.drawImage(img, x - sw / 2, y - sh / 2, sw, sh);
          } catch {
            ctx.fillStyle = node.color;
            ctx.fill();
          }
        } else {
          ctx.fillStyle = "#27272a";
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "#27272a";
        ctx.fill();
      }

      ctx.restore();
      ctx.save();

      // Border ring
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isHovered ? "#ffffff" : node.color;
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.globalAlpha = isHighlighted ? 1 : 0.2;
      ctx.stroke();
      ctx.restore();

      // Label (only if zoom is high enough)
      if (globalScale > 1.2 || isHovered) {
        const label = node.label;
        const fontSize = Math.max(10, 12 / globalScale);
        ctx.save();
        ctx.font = `${fontSize}px 'Inter', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.globalAlpha = isHighlighted ? 0.9 : 0.2;

        // Shadow / background for readability
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(
          x - textWidth / 2 - 3,
          y + radius + 3,
          textWidth + 6,
          fontSize + 2
        );

        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x, y + radius + 4);
        ctx.restore();
      }
    },
    [highlightNodes, hoverNode, forceUpdate]
  );

  const linkCanvasObject = useCallback(
    (linkRaw: any, ctx: CanvasRenderingContext2D) => {
      const link = linkRaw as GraphLink & { source: any; target: any };
      const src = link.source;
      const tgt = link.target;
      if (!src || !tgt) return;

      const srcId = typeof src === "object" ? src.id : src;
      const tgtId = typeof tgt === "object" ? tgt.id : tgt;
      const key = `${srcId}|||${tgtId}`;
      const keyAlt = `${tgtId}|||${srcId}`;
      const isHighlighted =
        highlightLinks.size === 0 || highlightLinks.has(key) || highlightLinks.has(keyAlt);

      const x1 = typeof src === "object" ? src.x : 0;
      const y1 = typeof src === "object" ? src.y : 0;
      const x2 = typeof tgt === "object" ? tgt.x : 0;
      const y2 = typeof tgt === "object" ? tgt.y : 0;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isHighlighted ? "#39F9CD" : "#3f3f46";
      ctx.lineWidth = isHighlighted ? Math.max(1, link.weight * 1) : 0.5;
      ctx.globalAlpha = isHighlighted ? 0.7 : 0.3;
      ctx.stroke();
      ctx.restore();
    },
    [highlightLinks]
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* ── Header ── */}
      <header className="py-2 px-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 shadow shrink-0">
        <span className="text-xl font-bold tracking-tight" style={{ color: "#39F9CD" }}>
          The Acquired Universe
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded text-sm font-medium text-zinc-400 hover:text-white transition"
          >
            Map View
          </Link>
          <Link
            href="/graph"
            className="px-3 py-1.5 rounded text-sm font-semibold text-black transition"
            style={{ backgroundColor: "#39F9CD" }}
          >
            Constellation View
          </Link>
          <Link
            href="/chronicles"
            className="px-3 py-1.5 rounded text-sm font-medium text-zinc-400 hover:text-white transition"
          >
            Chronicles
          </Link>
          <span className="w-px h-5 bg-zinc-700" />
          <a
            href="https://github.com/pcwu2022/acquired_universe"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 6.8c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </nav>
      </header>

      {/* ── Intro blurb ── */}
    <div className="w-full max-w-5xl mx-auto px-6 pt-4 pb-2 text-sm text-zinc-400 leading-relaxed shrink-0">
      Explore the constellation of companies across the{" "}
      <a
        href="https://www.acquired.fm"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold hover:underline"
        style={{ color: "#39F9CD" }}
      >
        Acquired
      </a>
      {" "} universe. Each node represents a company, sized by its gravitational pull—how often it's referenced across episodes. Connections reveal the hidden ties that bind this ecosystem together. Click any node to discover its story.
    </div>

      {/* ── Graph canvas ── */}
      <div
        ref={containerRef}
        className="flex-1 relative w-full overflow-hidden min-h-[85vh]"
        style={{
          background: "#18181b",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <ForceGraph2D
          ref={forceRef}
          graphData={graphData as any}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeId="id"
          nodeLabel="label"
          nodeVal="val"
          nodeCanvasObject={nodeCanvasObject as any}
          nodeCanvasObjectMode={() => "replace"}
          linkCanvasObject={linkCanvasObject as any}
          linkCanvasObjectMode={() => "replace"}
          onNodeHover={handleNodeHover as any}
          onNodeClick={handleNodeClick as any}
          nodePointerAreaPaint={(nodeRaw: any, color, ctx) => {
            const node = nodeRaw as GraphNode;
            const radius = 6 + Math.sqrt(node.degree) * 2.5 + 4;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          cooldownTicks={200}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          enableNodeDrag
          enableZoomInteraction
          minZoom={0.1}
          maxZoom={8}
        />

        <Legend />

        {/* Node count badge */}
        <div className="absolute top-3 left-3 z-10 bg-zinc-900/85 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-zinc-700 text-xs text-zinc-400 pointer-events-none">
          <span className="font-semibold text-white">{graphData.nodes.length}</span> companies
          &nbsp;·&nbsp;
          <span className="font-semibold text-white">{graphData.links.length}</span> connections
        </div>

        {/* Reset zoom button */}
        <button
          className="absolute top-3 right-3 z-10 bg-zinc-900/85 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition cursor-pointer"
          onClick={() => forceRef.current?.zoomToFit(400, 40)}
        >
          Fit to view
        </button>
      </div>

      {/* ── Footer ── */}
      <PageFooter page="graph" />

      {/* ── Node panel ── */}
      <NodePanel
        node={selectedNode}
        graphData={graphData}
        onClose={() => setSelectedNode(null)}
        onNavigate={(n) => setSelectedNode(n)}
      />
    </div>
  );
}
