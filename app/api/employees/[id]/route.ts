import { NextRequest, NextResponse } from "next/server";
import { nullifyEmpty } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("employees")
    .select("id, name, designation, qualification, dob, gender, religion, blood_group, nationality, email, phone_no, id_card, role_id, joining_date, shift, duty_start, duty_end, address, extra_activity, note, sms_receive_no, father_name, father_phone_no, mother_name, mother_phone_no, guardian, guardian_phone_no, present_address, permanent_address, status")
    .eq("id", parseInt(id))
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  const body = await request.json();
  const { error } = await supabase.from("employees").update(nullifyEmpty(body) as never).eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  await supabase.from("employees").update({ deleted_at: new Date().toISOString(), status: 0 } as never).eq("id", parseInt(id));
  return NextResponse.json({ ok: true });
}
