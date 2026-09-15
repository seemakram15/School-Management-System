import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function GradesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("grades")
    .select("id, name, percent_from, percent_to, grade_point, academic_years(title)")
    .is("deleted_at", null)
    .order("percent_from", { ascending: false });

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Grade Setup</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} grade entries</p>
        </div>
        <Link href="/exams/grades/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Grade</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name"]}
          columns={[
            { key: "name", label: "Grade" },
            {
              key: "academic_years", label: "Academic Year",
              render: r => (r as unknown as { academic_years: { title: string } | null }).academic_years?.title ?? "-",
            },
            { key: "percent_from", label: "% From", render: r => `${r.percent_from}%` },
            { key: "percent_to", label: "% To", render: r => `${r.percent_to}%` },
            { key: "grade_point", label: "GPA" },
          ]}
          actions={row => (
            <Link href={`/exams/grades/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          )}
        />
      </div>
    </div>
  );
}
