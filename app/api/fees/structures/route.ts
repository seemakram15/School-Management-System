import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  return user;
}

export async function GET(request: NextRequest) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const yearId = searchParams.get("academic_year_id");

  let query = supabase
    .from("fee_structures")
    .select("id, amount, frequency, due_day, fee_type_id, class_id, academic_year_id, fee_types(name), i_classes(name), academic_years(title)")
    .order("id");

  if (classId) query = query.eq("class_id", parseInt(classId));
  if (yearId) query = query.eq("academic_year_id", parseInt(yearId));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { fee_type_id, class_id, academic_year_id, amount, frequency, due_day } = await request.json();

  if (!fee_type_id || !class_id || !academic_year_id || amount == null) {
    return NextResponse.json({ error: "fee_type_id, class_id, academic_year_id, and amount are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fee_structures")
    .insert({
      fee_type_id: parseInt(fee_type_id),
      class_id: parseInt(class_id),
      academic_year_id: parseInt(academic_year_id),
      amount: parseFloat(amount),
      frequency: frequency || "monthly",
      due_day: parseInt(due_day ?? "10"),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
