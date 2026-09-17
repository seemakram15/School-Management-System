import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function RolesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("roles")
    .select("id, name, deletable, created_at")
    .is("deleted_at", null)
    .order("name");

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Roles</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} roles</p>
        </div>
        <Link href="/roles/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Role</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name"]}
          columns={[
            { key: "name", label: "Role Name" },
            {
              key: "deletable", label: "System Role",
              render: r => !r.deletable ? <Badge variant="info">System</Badge> : "—",
            },
          ]}
        />
      </div>
    </div>
  );
}
