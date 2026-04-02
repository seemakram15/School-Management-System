import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";

export default async function ResultsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("results")
    .select("id, total_marks, obtained_marks, percentage, is_pass, registrations(students(name), i_classes(name)), exams(name), grades(name)")
    .order("id", { ascending: false })
    .limit(100);

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Results</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Student exam results</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={[]}
          columns={[
            { key: "registrations", label: "Student" },
            { key: "exams", label: "Exam" },
            { key: "registrations_class", label: "Class" },
            { key: "total_marks", label: "Total" },
            { key: "obtained_marks", label: "Obtained" },
            { key: "percentage", label: "%" },
            { key: "grades", label: "Grade" },
            { key: "is_pass", label: "Result" },
          ]}
          rows={rows.map(r => {
            const grade = (r as unknown as { grades: { name: string } | null }).grades;
            return {
              registrations: (r as unknown as { registrations: { students: { name: string } | null; i_classes: { name: string } | null } | null }).registrations?.students?.name ?? "-",
              exams: (r as unknown as { exams: { name: string } | null }).exams?.name ?? "-",
              registrations_class: (r as unknown as { registrations: { i_classes: { name: string } | null } | null }).registrations?.i_classes?.name ?? "-",
              total_marks: r.total_marks,
              obtained_marks: r.obtained_marks,
              percentage: `${r.percentage}%`,
              grades: grade ? <Badge variant="info">{grade.name}</Badge> : "-",
              is_pass: <Badge variant={r.is_pass ? "success" : "danger"}>{r.is_pass ? "Pass" : "Fail"}</Badge>,
            };
          })}
        />
      </div>
    </div>
  );
}
