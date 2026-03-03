// graphData.ts
// Utilities for building force-graph data from company_relations.json + episodes.json

import episodesRaw from "../data/episodes.json";
import relationsRaw from "../data/company_relations.json";
import type { Episode } from "../../types/data";
import { CATEGORY_COLORS } from "./categories";

const episodes = episodesRaw as Episode[];
const relations = relationsRaw as unknown as Record<string, [string, number][]>;

/**
 * Find the best episode match for a company name from the relations graph.
 * Strategy: the relations key (e.g. "Google") is a substring of the episode
 * company name (e.g. "Google Part II"). Match is case-insensitive.
 * If multiple episodes match, pick the one whose company name is shortest
 * (closest match). Falls back to undefined if no match found.
 */
export function findEpisodeForCompany(name: string): Episode | undefined {
  const lower = name.toLowerCase();
  let best: Episode | undefined;
  let bestLen = Infinity;

  for (const ep of episodes) {
    const epLower = ep.company.toLowerCase();
    if (epLower.includes(lower) || lower.includes(epLower)) {
      if (ep.company.length < bestLen) {
        best = ep;
        bestLen = ep.company.length;
      }
    }
  }
  return best;
}

export type GraphNode = {
  id: string;       // company name from relations
  label: string;    // same as id
  sticker?: string; // episode sticker URL
  episode?: Episode;
  degree: number;
  val: number;      // for force-graph node size
  color: string;    // category ring color
  x?: number;
  y?: number;
};

export type GraphLink = {
  source: string;
  target: string;
  weight: number;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

let _cached: GraphData | null = null;

export function buildGraphData(): GraphData {
  if (_cached) return _cached;

  // Collect all node names
  const allNames = new Set<string>(Object.keys(relations));
  for (const targets of Object.values(relations)) {
    for (const [target] of targets) {
      allNames.add(target);
    }
  }

  // Resolve episodes — drop nodes with no match
  const episodeMap = new Map<string, Episode>();
  for (const name of allNames) {
    const ep = findEpisodeForCompany(name);
    if (ep) episodeMap.set(name, ep);
  }

  // Only keep names that have a matched episode
  const validNames = new Set(episodeMap.keys());

  // Build links, skipping any endpoint that was dropped
  const seenLinks = new Set<string>();
  const links: GraphLink[] = [];
  const degreeMap: Record<string, number> = {};

  for (const [source, targets] of Object.entries(relations)) {
    if (!validNames.has(source)) continue;
    for (const [target, weight] of targets) {
      if (!validNames.has(target)) continue;
      if (!degreeMap[source]) degreeMap[source] = 0;
      if (!degreeMap[target]) degreeMap[target] = 0;
      degreeMap[source] += 1;
      degreeMap[target] += 1;

      const key = [source, target].sort().join("|||");
      if (!seenLinks.has(key)) {
        seenLinks.add(key);
        links.push({ source, target, weight });
      }
    }
  }

  const nodes: GraphNode[] = Array.from(validNames).map((name) => {
    const episode = episodeMap.get(name)!;
    const degree = degreeMap[name] ?? 0;
    const catColor = (CATEGORY_COLORS[episode.category] ?? CATEGORY_COLORS["_default"]).ring;
    return {
      id: name,
      label: name,
      sticker: episode.sticker,
      episode,
      degree,
      val: Math.max(1, degree),
      color: catColor,
    };
  });

  _cached = { nodes, links };
  return _cached;
}
