import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { SUBJECT_TYPE } from "@/lib/utils";

export default async function SubjectsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id, name, type, status, i_classes(name)")
    .is("deleted_at", null)
    .order("name");

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Subjects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total subjects</p>
        </div>
        <Link href="/academic/subjects/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Subject</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name"]}
          columns={[
            {
              key: "i_classes", label: "Class",
              render: r => (r as unknown as { i_classes: { name: string } | null }).i_classes?.name ?? "-",
            },
            { key: "name", label: "Subject Name" },
            {
              key: "type", label: "Type",
              render: r => <Badge variant={r.type === 1 ? "info" : "warning"}>{SUBJECT_TYPE[r.type as 1 | 2]}</Badge>,
            },
            {
              key: "status", label: "Status",
              render: r => <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
            },
          ]}
          actions={row => (
            <Link href={`/academic/subjects/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          )}
        />
      </div>
    </div>
  );
}
