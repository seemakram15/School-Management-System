import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

const SUBJECT_TYPE_LABEL: Record<string, string> = { core: "Core", selective: "Selective", elective: "Elective" };
const SUBJECT_TYPE_VARIANT: Record<string, "info" | "warning" | "success"> = { core: "info", selective: "warning", elective: "success" };

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
            { key: "i_classes", label: "Class" },
            { key: "name", label: "Subject Name" },
            { key: "type", label: "Type" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            i_classes: (r as unknown as { i_classes: { name: string } | null }).i_classes?.name ?? "-",
            name: r.name,
            type: <Badge variant={SUBJECT_TYPE_VARIANT[r.type] ?? "info"}>{SUBJECT_TYPE_LABEL[r.type] ?? r.type}</Badge>,
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/academic/subjects/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
