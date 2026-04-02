import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SubjectEditForm from "./SubjectEditForm";

export default async function SubjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id, name, code, type, class_id, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <SubjectEditForm subject={data} />;
}
