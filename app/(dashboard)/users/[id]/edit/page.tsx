import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import UserEditForm from "./UserEditForm";

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, username, email, phone_no, status, force_logout, user_roles(role_id)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <UserEditForm user={data} />;
}
