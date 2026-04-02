import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "1";

  const { data, error } = await supabase
    .from("employees")
    .select("id, name, id_card, role_id, designation, qualification, dob, gender, religion, blood_group, nationality, email, phone_no, photo, extra_activity, note, joining_date, status, teacher_profiles(subjects(name))")
    .eq("status", parseInt(status))
    .is("deleted_at", null)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { name, id_card, role_id, designation, qualification, dob, gender, religion, blood_group, nationality,
    email, phone_no, photo, extra_activity, note, joining_date, present_address, permanent_address,
    father_name, father_phone_no, mother_name, mother_phone_no, guardian, guardian_phone_no,
    sms_receive_no } = body;

  const { data, error } = await supabase.from("employees")
    .insert({ name, id_card, role_id: parseInt(role_id), designation, qualification, dob, gender, religion, blood_group, nationality,
      email, phone_no, photo, extra_activity, note, joining_date, present_address, permanent_address,
      father_name, father_phone_no, mother_name, mother_phone_no, guardian, guardian_phone_no,
      sms_receive_no: parseInt(sms_receive_no) || 0, status: 1 } as never)
    .select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
