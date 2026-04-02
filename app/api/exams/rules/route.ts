import { NextRequest, NextResponse } from "next/server";
import { nullifyEmpty } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createAdminClient();
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("exam_id");
  const classId = searchParams.get("class_id");
  const subjectId = searchParams.get("subject_id");

  let query = supabase.from("exam_rules").select("id, exam_id, class_id, subject_id, total_marks, pass_marks, marks_distribution");
  if (examId) query = query.eq("exam_id", examId);
  if (classId) query = query.eq("class_id", classId);
  if (subjectId) query = query.eq("subject_id", subjectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("exam_rules").insert(nullifyEmpty(body)).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
