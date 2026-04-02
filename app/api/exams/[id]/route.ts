import { NextRequest, NextResponse } from "next/server";
import { nullifyEmpty } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("exams")
    .select("id, name, status, class_id, academic_year_id, start_date, end_date")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  const body = await request.json();
  const { error } = await supabase.from("exams").update(nullifyEmpty(body) as never).eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createAdminClient();
  const { id } = await params;
  const { error } = await supabase.from("exams").update({ deleted_at: new Date().toISOString(), status: 0 } as never).eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
