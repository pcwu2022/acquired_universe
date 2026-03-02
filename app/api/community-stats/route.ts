import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../utils/supabase";

// GET /api/community-stats — returns aggregated survey counts
export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("community_surveys")
    .select("age_group, gender, industry, platforms, frequency, discovery, favorite_episode, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ total: 0, age_group: {}, gender: {}, industry: {}, platforms: {}, frequency: {}, discovery: {}, favorite_episodes: [], messages: [] });
  }

  // Aggregate counts
  const agg: {
    total: number;
    age_group: Record<string, number>;
    gender: Record<string, number>;
    industry: Record<string, number>;
    platforms: Record<string, number>;
    frequency: Record<string, number>;
    discovery: Record<string, number>;
    favorite_episodes: { episode: string; count: number }[];
    messages: string[];
  } = {
    total: data.length,
    age_group: {},
    gender: {},
    industry: {},
    platforms: {},
    frequency: {},
    discovery: {},
    favorite_episodes: [],
    messages: [],
  };

  const episodeCounts: Record<string, number> = {};

  for (const row of data) {
    if (row.age_group) agg.age_group[row.age_group] = (agg.age_group[row.age_group] || 0) + 1;
    if (row.gender) agg.gender[row.gender] = (agg.gender[row.gender] || 0) + 1;
    if (row.industry) agg.industry[row.industry] = (agg.industry[row.industry] || 0) + 1;
    if (row.frequency) agg.frequency[row.frequency] = (agg.frequency[row.frequency] || 0) + 1;
    if (row.discovery) agg.discovery[row.discovery] = (agg.discovery[row.discovery] || 0) + 1;
    if (row.platforms && Array.isArray(row.platforms)) {
      for (const p of row.platforms) {
        agg.platforms[p] = (agg.platforms[p] || 0) + 1;
      }
    }
    if (row.favorite_episode) {
      episodeCounts[row.favorite_episode] = (episodeCounts[row.favorite_episode] || 0) + 1;
    }
    if (row.message && typeof row.message === "string" && row.message.trim() && agg.messages.length < 20) {
      agg.messages.push(row.message.trim());
    }
  }

  agg.favorite_episodes = Object.entries(episodeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([episode, count]) => ({ episode, count }));

  return NextResponse.json(agg);
}

// POST /api/community-stats — accepts one anonymous survey submission
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { age_group, gender, industry, platforms, frequency, discovery, favorite_episode, message, city, listener_since } = body;

  if (!age_group) {
    return NextResponse.json({ error: "age_group is required" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("community_surveys").insert([{
    age_group,
    gender: gender || null,
    industry: industry || null,
    platforms: platforms || [],
    frequency: frequency || null,
    discovery: discovery || null,
    favorite_episode: favorite_episode || null,
    message: message || null,
    city: city || null,
    listener_since: listener_since || null,
  }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
