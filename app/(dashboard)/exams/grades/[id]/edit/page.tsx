import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GradeEditForm } from "./GradeEditForm";

export default async function GradeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: grade } = await supabase
    .from("grades")
    .select("id, academic_year_id, name, percent_from, percent_to, grade_point, pass_mark")
    .eq("id", id)
    .single();

  if (!grade) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Grade</h2>
        <p className="text-sm text-muted-foreground">Edit Grade</p>
      </div>
      <GradeEditForm grade={grade} />
    </div>
  );
}
