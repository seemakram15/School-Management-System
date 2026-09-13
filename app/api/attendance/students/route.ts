import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const sectionId = searchParams.get("section_id");
  const date = searchParams.get("date");
  const month = searchParams.get("month");

  if (date && classId && sectionId) {
    const { data } = await supabase
      .from("student_attendances")
      .select("id, registration_id, attendance_date, status")
      .eq("attendance_date", date)
      .eq("class_id", classId)
      .eq("section_id", sectionId);
    return NextResponse.json(data ?? []);
  }

  if (month && classId && sectionId) {
    const [y, m] = month.split("-");
    const start = `${y}-${m}-01`;
    const end = new Date(parseInt(y), parseInt(m), 0).toISOString().split("T")[0];
    const { data } = await supabase
      .from("student_attendances")
      .select("id, registration_id, attendance_date, status")
      .eq("class_id", classId)
      .eq("section_id", sectionId)
      .gte("attendance_date", start)
      .lte("attendance_date", end);
    return NextResponse.json(data ?? []);
  }

  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { class_id, section_id, academic_year_id, attendance_date, registrationIds, present } = await request.json();

  const rows = registrationIds.map((regId: number) => ({
    registration_id: regId,
    class_id: parseInt(class_id),
    section_id: parseInt(section_id),
    academic_year_id: parseInt(academic_year_id),
    attendance_date,
    status: present?.[regId] ? 1 : 0,
  }));

  const { error } = await supabase.from("student_attendances").upsert(rows, { onConflict: "registration_id,attendance_date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: rows.length });
}
