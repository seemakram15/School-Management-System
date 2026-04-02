import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("roles").select("id, name, deletable").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { name, permissions } = await request.json();
  const { data, error } = await supabase.from("roles").insert({ name, deletable: true }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (permissions?.length) {
    const { data: permRows } = await supabase.from("permissions").select("id, slug").in("slug", permissions);
    if (permRows?.length) {
      await supabase.from("roles_permissions").insert(
        permRows.map(p => ({ role_id: data.id, permission_id: p.id }))
      );
    }
  }
  return NextResponse.json(data, { status: 201 });
}
