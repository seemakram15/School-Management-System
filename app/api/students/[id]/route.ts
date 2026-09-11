import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { id } = await params;
  const regId = parseInt(id);

  const { data: reg } = await supabase.from("registrations").select("student_id").eq("id", regId).single();
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const studentFields: Record<string, unknown> = {};
  const regFields: Record<string, unknown> = {};

  const studentKeys = ["name","nick_name","dob","gender","religion","blood_group","nationality",
    "email","phone_no","photo","extra_activity","note","father_name","father_phone_no",
    "mother_name","mother_phone_no","guardian","guardian_phone_no","present_address",
    "permanent_address","sms_receive_no","siblings"];
  const regKeys = ["shift","card_no","roll_no","board_regi_no","house"];

  for (const key of studentKeys) if (key in body) studentFields[key] = body[key];
  for (const key of regKeys) if (key in body) regFields[key] = body[key];

  if (Object.keys(studentFields).length) {
    await supabase.from("students").update(studentFields).eq("id", reg.student_id);
  }
  if (Object.keys(regFields).length) {
    await supabase.from("registrations").update(regFields).eq("id", regId);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const regId = parseInt(id);

  const { data: reg } = await supabase.from("registrations").select("student_id, is_promoted").eq("id", regId).single();
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reg.is_promoted) return NextResponse.json({ error: "Promoted student cannot be deleted" }, { status: 400 });

  await supabase.from("registrations").delete().eq("id", regId);
  await supabase.from("students").update({ deleted_at: new Date().toISOString() }).eq("id", reg.student_id);

  return NextResponse.json({ ok: true });
}
