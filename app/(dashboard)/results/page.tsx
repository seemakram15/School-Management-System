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
            {
              key: "registrations", label: "Student",
              render: r => (r as unknown as { registrations: { students: { name: string } | null; i_classes: { name: string } | null } | null }).registrations?.students?.name ?? "-",
            },
            {
              key: "exams", label: "Exam",
              render: r => (r as unknown as { exams: { name: string } | null }).exams?.name ?? "-",
            },
            {
              key: "registrations_class", label: "Class",
              render: r => (r as unknown as { registrations: { i_classes: { name: string } | null } | null }).registrations?.i_classes?.name ?? "-",
            },
            { key: "total_marks", label: "Total" },
            { key: "obtained_marks", label: "Obtained" },
            { key: "percentage", label: "%", render: r => `${r.percentage}%` },
            {
              key: "grades", label: "Grade",
              render: r => {
                const g = (r as unknown as { grades: { name: string } | null }).grades;
                return g ? <Badge variant="info">{g.name}</Badge> : "-";
              },
            },
            {
              key: "is_pass", label: "Result",
              render: r => <Badge variant={r.is_pass ? "success" : "danger"}>{r.is_pass ? "Pass" : "Fail"}</Badge>,
            },
          ]}
        />
      </div>
    </div>
  );
}
