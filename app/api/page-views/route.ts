import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../utils/supabase";

// GET /api/page-views — returns { total, pages }
export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("page_views")
    .select("page, count");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pages: Record<string, number> = {};
  let total = 0;
  for (const row of data ?? []) {
    pages[row.page] = row.count;
    total += row.count;
  }

  return NextResponse.json({ total, pages });
}

// POST /api/page-views — increments the view count for a page
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { page } = body as { page: string };

  if (!page) {
    return NextResponse.json({ error: "Missing field: page" }, { status: 400 });
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("increment_page_view", { p_page: page });

  if (error) {
    // Fallback: plain upsert
    const { error: upsertError } = await supabase
      .from("page_views")
      .upsert([{ page, count: 1 }], { onConflict: "page" });
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
