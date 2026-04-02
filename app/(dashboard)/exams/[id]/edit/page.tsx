import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExamEditForm } from "./ExamEditForm";

export default async function ExamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: exam } = await supabase
    .from("exams")
    .select("id, name, status, class_id, academic_year_id, start_date, end_date")
    .eq("id", id)
    .single();

  if (!exam) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Exam</h2>
        <p className="text-sm text-muted-foreground">Edit Exam</p>
      </div>
      <ExamEditForm exam={exam} />
    </div>
  );
}
