import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function ClassProfilesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_profiles")
    .select("id, description, status, i_classes(name)")
    .order("id", { ascending: false });

  type ClassProfileRow = { id: number; description: string | null; status: number | null; i_classes: { name: string } | null };
  const rows = (data ?? []) as unknown as ClassProfileRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Class Profiles</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total class profiles</p>
        </div>
        <Link href="/site/classes/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Class Profile</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchable={false}
          columns={[
            { key: "class", label: "Class" },
            { key: "description", label: "Description" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            class: r.i_classes?.name ?? "-",
            description: r.description ? (r.description.length > 60 ? `${r.description.slice(0, 60)}...` : r.description) : "-",
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/classes/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
