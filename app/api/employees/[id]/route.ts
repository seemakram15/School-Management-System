import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const body = await request.json();
  const { error } = await supabase.from("employees").update(body).eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  await supabase.from("employees").update({ deleted_at: new Date().toISOString(), status: 0 }).eq("id", parseInt(id));
  return NextResponse.json({ ok: true });
}
