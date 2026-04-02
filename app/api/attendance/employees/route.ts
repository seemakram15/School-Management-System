import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createAdminClient();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (date) {
    const { data } = await supabase
      .from("employee_attendances")
      .select("id, employee_id, attendance_date, attendance")
      .eq("attendance_date", date);
    return NextResponse.json(data ?? []);
  }

  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  const { attendance_date, employeeIds, present } = await request.json();

  const rows = employeeIds.map((empId: number) => ({
    employee_id: empId,
    attendance_date,
    attendance: present?.[empId] ? 1 : 0,
  }));

  const { error } = await supabase.from("employee_attendances").upsert(rows, { onConflict: "employee_id,attendance_date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: rows.length });
}
