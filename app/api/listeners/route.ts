import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../utils/supabase";

// GET /api/listeners — returns all listener records from Supabase
export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("listeners")
    .select("city, entry_date, count");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/listeners — insert or increment (city, entry_date) listener count
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { city, entry_date } = body as { city: string; entry_date: string };

  if (!city || !entry_date) {
    return NextResponse.json(
      { error: "Missing fields: city, entry_date" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  // Try calling the upsert_listener RPC (increment count if row exists, else insert)
  const { error: rpcError } = await supabase.rpc("upsert_listener", {
    p_city: city,
    p_entry_date: entry_date,
  });

  if (rpcError) {
    // Fallback: plain insert (safe even without the RPC, creates a new row with count=1)
    const { error: insertError } = await supabase
      .from("listeners")
      .insert([{ city, entry_date, count: 1 }]);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
