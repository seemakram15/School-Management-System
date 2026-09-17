import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil } from "lucide-react";
import { GENDER, formatDate } from "@/lib/utils";

export default async function TeachersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("id, name, email, phone_no, gender, joining_date, status, id_card, designation")
    .eq("role_id", 3) // teacher role
    .is("deleted_at", null)
    .order("name");

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Teachers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total teachers</p>
        </div>
        <Link href="/teachers/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Teacher</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name", "email", "id_card"]}
          columns={[
            { key: "id_card", label: "ID" },
            { key: "name", label: "Name" },
            { key: "email", label: "Email", render: r => r.email || "-" },
            { key: "phone_no", label: "Phone", render: r => r.phone_no || "-" },
            { key: "gender", label: "Gender", render: r => GENDER[r.gender as 1 | 2] },
            { key: "joining_date", label: "Joined", render: r => formatDate(r.joining_date) },
            {
              key: "status", label: "Status",
              render: r => <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
            },
          ]}
          actions={row => (
            <div className="flex items-center justify-end gap-2">
              <Link href={`/teachers/${row.id}`}>
                <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
              </Link>
              <Link href={`/teachers/${row.id}/edit`}>
                <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
              </Link>
            </div>
          )}
        />
      </div>
    </div>
  );
}
