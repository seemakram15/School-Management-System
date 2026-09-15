import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const classId = new URL(request.url).searchParams.get("class_id");

  let query = supabase.from("exams").select("id, name, start_date, end_date, class_id, academic_year_id, status, i_classes(name), academic_years(title)");
  if (classId) query = query.eq("class_id", classId);

  const { data, error } = await query.order("start_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("exams").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
