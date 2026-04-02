import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("timeline_items")
    .select("id, year, title, description, order, status")
    .order("order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { year, title, description, order, status } = body;
  if (!year || !title) return NextResponse.json({ error: "Year and title are required" }, { status: 400 });

  const { data, error } = await supabase
    .from("timeline_items")
    .insert({ year, title, description: description || null, order: order ?? 0, status: status ?? 1 } as never)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
