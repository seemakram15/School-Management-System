import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const roleId = parseInt(id);

  const { data: role, error } = await supabase.from("roles").select("id, name, deletable").eq("id", roleId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: rp } = await supabase
    .from("roles_permissions")
    .select("permissions(slug)")
    .eq("role_id", roleId);

  const permissions = (rp ?? [])
    .map(r => (r as unknown as { permissions: { slug: string } | null }).permissions?.slug)
    .filter(Boolean);

  return NextResponse.json({ ...role, permissions });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const roleId = parseInt(id);
  const { name, permissions } = await request.json();

  const { data: role } = await supabase.from("roles").select("deletable").eq("id", roleId).single();
  if (role && role.deletable === false) {
    return NextResponse.json({ error: "This is a system role and cannot be edited" }, { status: 403 });
  }

  const { error } = await supabase.from("roles").update({ name } as never).eq("id", roleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("roles_permissions").delete().eq("role_id", roleId);
  if (permissions?.length) {
    const { data: permRows } = await supabase.from("permissions").select("id, slug").in("slug", permissions);
    if (permRows?.length) {
      await supabase.from("roles_permissions").insert(
        permRows.map(p => ({ role_id: roleId, permission_id: p.id }))
      );
    }
  }
  return NextResponse.json({ ok: true });
}
