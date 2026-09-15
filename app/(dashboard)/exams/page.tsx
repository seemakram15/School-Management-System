import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exams")
    .select("id, name, status, created_at, academic_years(title)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Exams</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total exams</p>
        </div>
        <Link href="/exams/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Exam</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name"]}
          columns={[
            { key: "name", label: "Exam Name" },
            {
              key: "academic_years", label: "Academic Year",
              render: r => (r as unknown as { academic_years: { title: string } | null }).academic_years?.title ?? "-",
            },
            { key: "created_at", label: "Created", render: r => formatDate(r.created_at) },
            {
              key: "status", label: "Status",
              render: r => <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
            },
          ]}
          actions={row => (
            <Link href={`/exams/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          )}
        />
      </div>
    </div>
  );
}
