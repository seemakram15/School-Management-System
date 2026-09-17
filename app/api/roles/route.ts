import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("roles").select("id, name, is_system_role").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { name, permissions } = await request.json();
  const { data, error } = await supabase.from("roles").insert({ name, is_system_role: false }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (permissions?.length) {
    await supabase.from("permissions").insert(
      permissions.map((p: string) => ({ role_id: data.id, name: p }))
    );
  }
  return NextResponse.json(data, { status: 201 });
}
