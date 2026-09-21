import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const sectionId = searchParams.get("section_id");
  const status = searchParams.get("status") ?? "1";

  let query = supabase
    .from("registrations")
    .select("id, regi_no, roll_no, card_no, board_regi_no, shift, status, is_promoted, house, student_id, class_id, section_id, academic_year_id, students(id, name, nick_name, phone_no, email, gender, dob, photo, status, father_name, mother_name, guardian, siblings), i_classes(name), sections(name), academic_years(title, is_running)")
    .eq("students.status", parseInt(status));

  if (classId) query = query.eq("class_id", classId);
  if (sectionId) query = query.eq("section_id", sectionId);

  const { data, error } = await query.order("roll_no");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { name, nick_name, dob, gender, religion, blood_group, nationality, nationality_other,
    email, phone_no, photo, extra_activity, note,
    father_name, father_phone_no, mother_name, mother_phone_no, guardian, guardian_phone_no,
    present_address, permanent_address,
    class_id, section_id, academic_year_id, shift, card_no, roll_no, board_regi_no, sms_receive_no, siblings, house,
    core_subjects, selective_subjects, fourth_subject,
    username, password } = body;

  const { data: student, error: sErr } = await supabase
    .from("students")
    .insert({ name, nick_name, dob, gender, religion, blood_group,
      nationality: nationality === "Other" ? (nationality_other || "Other") : nationality,
      email, phone_no, photo, extra_activity, note,
      father_name, father_phone_no, mother_name, mother_phone_no, guardian, guardian_phone_no,
      present_address, permanent_address, sms_receive_no: parseInt(sms_receive_no) || 0, siblings, status: 1 })
    .select("id")
    .single();

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const year = academic_year_id || (await supabase.from("academic_years").select("id").eq("is_running", true).single()).data?.id;

  const regiNo = `${new Date().getFullYear()}${String(student!.id).padStart(6, "0")}`;

  const { data: reg, error: rErr } = await supabase
    .from("registrations")
    .insert({ student_id: student!.id, class_id: parseInt(class_id), section_id: parseInt(section_id),
      academic_year_id: year, shift, card_no, roll_no: roll_no ? parseInt(roll_no) : null,
      board_regi_no, house, regi_no: regiNo, status: 1, is_promoted: 0 })
    .select("id")
    .single();

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  if (core_subjects?.length) {
    await supabase.from("registration_subjects").insert(
      core_subjects.map((sid: number) => ({ registration_id: reg!.id, subject_id: sid, type: "core" }))
    );
  }
  if (selective_subjects?.length) {
    await supabase.from("registration_subjects").insert(
      selective_subjects.map((sid: number) => ({ registration_id: reg!.id, subject_id: sid, type: "selective" }))
    );
  }
  if (fourth_subject) {
    await supabase.from("registration_subjects").insert({ registration_id: reg!.id, subject_id: fourth_subject, type: "elective" });
  }

  // Notify school owner
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (user) {
    await createNotification({
      type: "student_enrolled",
      notifiable_id: user.id,
      message: `New student enrolled: ${name} (${regiNo})`,
      link: `/students/${student!.id}`,
      meta: { student_id: student!.id, regi_no: regiNo, class_id },
    });
  }

  return NextResponse.json({ id: reg!.id, regi_no: regiNo });
}
