import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("exam_id");
  const classId = searchParams.get("class_id");
  const sectionId = searchParams.get("section_id");
  const subjectId = searchParams.get("subject_id");

  let query = supabase.from("marks").select("id, registration_id, exam_id, subject_id, marks_data, total_marks, is_absent, registrations(roll_no, students(name))");
  if (examId) query = query.eq("exam_id", examId);
  if (classId) query = query.eq("class_id", classId);
  if (sectionId) query = query.eq("section_id", sectionId);
  if (subjectId) query = query.eq("subject_id", subjectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { academic_year_id, class_id, section_id, subject_id, exam_id, registrationIds, type: marksType, absent } = await request.json();

  const rows = registrationIds.map((regId: number) => {
    const marksData = marksType?.[regId] ?? {};
    const total = Object.values(marksData as Record<string, number>).reduce((s: number, v) => s + (Number(v) || 0), 0);
    return {
      registration_id: regId,
      class_id: parseInt(class_id),
      section_id: parseInt(section_id),
      subject_id: parseInt(subject_id),
      exam_id: parseInt(exam_id),
      academic_year_id: parseInt(academic_year_id),
      marks_data: JSON.stringify(marksData),
      total_marks: total,
      is_absent: absent?.[regId] ? 1 : 0,
    };
  });

  const { error } = await supabase.from("marks").upsert(rows, { onConflict: "registration_id,exam_id,subject_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
