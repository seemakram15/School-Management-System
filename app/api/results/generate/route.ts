import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { class_id, exam_id, academic_year_id, publish_date } = await request.json();

  const { data: students } = await supabase
    .from("registrations")
    .select("id, roll_no, student_id")
    .eq("class_id", class_id)
    .eq("academic_year_id", academic_year_id)
    .eq("status", 1);

  if (!students?.length) return NextResponse.json({ error: "No students found" }, { status: 400 });

  const { data: allMarks } = await supabase
    .from("marks")
    .select("registration_id, total_marks, is_absent, subjects(type)")
    .eq("exam_id", exam_id)
    .eq("class_id", class_id);

  const { data: grades } = await supabase.from("grades").select("*").order("mark_from", { ascending: false });

  const results = students.map(student => {
    const studentMarks = allMarks?.filter(m => m.registration_id === student.id) ?? [];
    const totalMarks = studentMarks.reduce((s, m) => s + (m.total_marks || 0), 0);
    const maxMarks = studentMarks.length * 100;
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    const isAbsent = studentMarks.some(m => m.is_absent);

    const grade = grades?.find(g => percentage >= g.mark_from && percentage <= g.mark_to);

    return {
      registration_id: student.id,
      exam_id: parseInt(exam_id),
      academic_year_id: parseInt(academic_year_id),
      class_id: parseInt(class_id),
      total_marks: totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      grade_id: grade?.id ?? null,
      is_passed: !isAbsent && percentage >= (grade?.pass_mark ?? 0) ? 1 : 0,
      publish_date,
    };
  });

  const { error } = await supabase.from("results").upsert(results, { onConflict: "registration_id,exam_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: results.length });
}
