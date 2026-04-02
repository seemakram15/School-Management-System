import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AcademicYearsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("academic_years")
    .select("id, title, year, is_running, start_date, end_date, status")
    .order("start_date", { ascending: false, nullsFirst: false });

  type YearRow = { id: number; title: string; year: string; is_running: boolean | null; start_date: string | null; end_date: string | null; status: number | null };
  const rows = (data ?? []) as YearRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Academic Years</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total academic years</p>
        </div>
        <Link href="/academic-years/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Academic Year</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["title", "year"]}
          columns={[
            { key: "title", label: "Title" },
            { key: "year", label: "Year" },
            { key: "start_date", label: "Start Date" },
            { key: "end_date", label: "End Date" },
            { key: "is_running", label: "Running" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            title: r.title,
            year: r.year,
            start_date: formatDate(r.start_date),
            end_date: formatDate(r.end_date),
            is_running: r.is_running ? <Badge variant="info">Running</Badge> : "—",
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/academic-years/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
