import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, username, email, status, is_super_admin, created_at, user_roles(roles(name))")
    .is("deleted_at", null)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { name, username, email, phone_no, password, role_id, status } = await request.json();

  if (!name || !username || !email || !password || !role_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError || !created.user) {
    return NextResponse.json({ error: authError?.message || "Failed to create auth user" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: created.user.id,
    name,
    username,
    email,
    phone_no: phone_no || null,
    status: status ?? 1,
  } as never);
  if (insertError) {
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: roleError } = await supabase.from("user_roles").insert({ user_id: created.user.id, role_id } as never);
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });

  return NextResponse.json({ id: created.user.id }, { status: 201 });
}
