import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AcademicYearEditForm from "./AcademicYearEditForm";

export default async function AcademicYearEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("academic_years")
    .select("id, title, year, start_date, end_date, is_running, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <AcademicYearEditForm year={data} />;
}
