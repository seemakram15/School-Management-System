import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("registrations")
    .select("id, roll_no, card_no, board_regi_no, shift, house, student_id, class_id, section_id, students(*)")
    .eq("id", parseInt(id))
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const body = await request.json();
  const { id } = await params;
  const regId = parseInt(id);

  const { data: reg } = await supabase.from("registrations").select("student_id").eq("id", regId).single();
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // ponytail: Database generic sometimes resolves the select() result to `never` here; cast the
  // fixed 'student_id' shape once at the eq() call sites below instead of widening the query type.

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
    await supabase.from("students").update(studentFields as never).eq("id", (reg as { student_id: number }).student_id);
  }
  if (Object.keys(regFields).length) {
    await supabase.from("registrations").update(regFields as never).eq("id", regId);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  const regId = parseInt(id);

  const { data: regRaw } = await supabase.from("registrations").select("student_id, is_promoted").eq("id", regId).single();
  if (!regRaw) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const reg = regRaw as { student_id: number; is_promoted: boolean };
  if (reg.is_promoted) return NextResponse.json({ error: "Promoted student cannot be deleted" }, { status: 400 });

  await supabase.from("registrations").delete().eq("id", regId);
  await supabase.from("students").update({ deleted_at: new Date().toISOString() } as never).eq("id", reg.student_id);

  return NextResponse.json({ ok: true });
}
