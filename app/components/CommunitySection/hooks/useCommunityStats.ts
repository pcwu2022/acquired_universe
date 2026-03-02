"use client";
import { useState, useEffect } from "react";

export interface CommunityStats {
  total: number;
  age_group: Record<string, number>;
  gender: Record<string, number>;
  industry: Record<string, number>;
  platforms: Record<string, number>;
  frequency: Record<string, number>;
  discovery: Record<string, number>;
  favorite_episodes: { episode: string; count: number }[];
  messages: string[];
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/community-stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
