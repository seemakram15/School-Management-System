import { NextRequest, NextResponse } from "next/server";
import { nullifyEmpty } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createAdminClient();
  const academicYearId = new URL(request.url).searchParams.get("academic_year_id");

  let query = supabase.from("grades").select("id, academic_year_id, name, percent_from, percent_to, grade_point, pass_mark").is("deleted_at", null);
  if (academicYearId) query = query.eq("academic_year_id", academicYearId);

  const { data, error } = await query.order("percent_from", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("grades").insert(nullifyEmpty(body) as never).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
