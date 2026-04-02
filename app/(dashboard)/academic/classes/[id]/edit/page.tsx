import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ClassEditForm from "./ClassEditForm";

export default async function ClassEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("i_classes")
    .select("id, name, numeric_value, have_selective_subject, max_selective_subject, have_elective_subject, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <ClassEditForm cls={data} />;
}
