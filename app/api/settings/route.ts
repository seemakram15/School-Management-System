import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const upserts = Object.entries(body).map(([meta_key, meta_value]) => ({
    meta_key,
    meta_value: String(meta_value),
  }));

  const { error } = await supabase.from("app_metas").upsert(upserts, { onConflict: "meta_key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
