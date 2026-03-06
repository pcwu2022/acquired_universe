// graphData.ts
// Utilities for building force-graph data from company_relations.json + episodes.json

import episodesRaw from "../data/episodes.json";
import relationsRaw from "../data/company_relations.json";
import type { Episode } from "../../types/data";
import { CATEGORY_COLORS } from "./categories";

const episodes = episodesRaw as Episode[];
const relations = relationsRaw as unknown as Record<string, [string, number][]>;

// Build a direct map from constellation company name → Episode using ep.company.
const _constellationToEpisode = new Map<string, Episode>();
for (const ep of episodes) {
  if (ep.company) _constellationToEpisode.set(ep.company, ep);
}

/**
 * Find the episode for a constellation-view company name.
 * Uses the company field in episodes.json for a direct lookup.
 */
export function findEpisodeForCompany(name: string): Episode | undefined {
  return _constellationToEpisode.get(name);
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
