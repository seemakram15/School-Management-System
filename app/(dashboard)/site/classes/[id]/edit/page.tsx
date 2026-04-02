import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ClassProfileEditForm from "./ClassProfileEditForm";

export default async function ClassProfileEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_profiles")
    .select("id, class_id, description, image, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <ClassProfileEditForm profile={data} />;
}
