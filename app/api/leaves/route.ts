import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase.from("leaves").select("id, employee_id, leave_type, from_date, to_date, reason, status, employees(name, designation)");
  if (status !== null && status !== "") query = query.eq("status", parseInt(status));

  const { data, error } = await query.order("from_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("leaves").insert({ ...body, status: 0 }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
