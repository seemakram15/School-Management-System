import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RoleEditForm from "./RoleEditForm";

export default async function RoleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: role } = await supabase.from("roles").select("id, name, deletable").eq("id", parseInt(id)).single();
  if (!role) notFound();

  const { data: rp } = await supabase.from("roles_permissions").select("permissions(slug)").eq("role_id", role.id);
  const selected = (rp ?? [])
    .map(r => (r as unknown as { permissions: { slug: string } | null }).permissions?.slug)
    .filter((s): s is string => Boolean(s));

  return <RoleEditForm role={role} initialSelected={selected} />;
}
