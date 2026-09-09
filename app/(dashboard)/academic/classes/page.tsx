import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("i_classes")
    .select("id, name, numeric_value, have_selective_subject, have_elective_subject, status")
    .order("numeric_value", { ascending: true, nullsFirst: false });

  type ClassRow = { id: number; name: string; numeric_value: number | null; have_selective_subject: boolean | null; have_elective_subject: boolean | null; status: number | null };
  const rows = (data ?? []) as ClassRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Classes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total classes</p>
        </div>
        <Link href="/academic/classes/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Class</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name"]}
          columns={[
            { key: "numeric_value", label: "#", render: r => r.numeric_value ?? "-" },
            { key: "name", label: "Class Name" },
            {
              key: "status", label: "Status",
              render: r => <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
            },
          ]}
          actions={row => (
            <Link href={`/academic/classes/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          )}
        />
      </div>
    </div>
  );
}
