import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient } from "../utils/supabase";

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.city || !data.lat || !data.lng || !data.entry_date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  // Insert into Supabase (if env vars are set)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("listeners").insert([{ ...data }]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
