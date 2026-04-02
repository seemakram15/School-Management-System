import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SectionEditForm from "./SectionEditForm";

export default async function SectionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("sections")
    .select("id, name, class_id, capacity, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <SectionEditForm section={data} />;
}
