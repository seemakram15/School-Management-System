import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("users")
    .select("id, name, username, email, phone_no, status, force_logout, user_roles(role_id)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { name, username, email, phone_no, status, force_logout, role_id } = await request.json();

  const { error } = await supabase
    .from("users")
    .update({ name, username, email, phone_no, status, force_logout } as never)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (role_id) {
    await supabase.from("user_roles").delete().eq("user_id", id);
    const { error: roleError } = await supabase.from("user_roles").insert({ user_id: id, role_id } as never);
    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  // Soft delete only — the underlying Supabase auth user is left intact.
  const { error } = await supabase
    .from("users")
    .update({ status: 0, deleted_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
