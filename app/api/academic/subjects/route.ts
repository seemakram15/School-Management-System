import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const type = searchParams.get("type");

  let query = supabase.from("subjects").select("id, name, code, type, class_id").eq("status", 1);
  if (classId) query = query.eq("class_id", classId);
  if (type) query = query.eq("type", type);

  const { data, error } = await query.order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("subjects").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
