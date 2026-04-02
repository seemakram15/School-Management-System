import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil } from "lucide-react";
import { GENDER, formatDate } from "@/lib/utils";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("id, name, email, phone_no, gender, joining_date, status, id_card, designation, roles:role_id(name)")
    .is("deleted_at", null)
    .order("name");

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Employees</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total employees</p>
        </div>
        <Link href="/hrm/employees/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Employee</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name", "email", "id_card"]}
          columns={[
            { key: "id_card", label: "ID Card" },
            { key: "name", label: "Name" },
            { key: "roles", label: "Role" },
            { key: "email", label: "Email" },
            { key: "phone_no", label: "Phone" },
            { key: "gender", label: "Gender" },
            { key: "joining_date", label: "Joined" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => {
            const role = (r as unknown as { roles: { name: string } | null }).roles;
            return {
              id_card: r.id_card,
              name: r.name,
              roles: <Badge variant="info">{role?.name ?? "-"}</Badge>,
              email: r.email || "-",
              phone_no: r.phone_no || "-",
              gender: GENDER[String(r.gender)] ?? r.gender,
              joining_date: formatDate(r.joining_date),
              status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
            };
          })}
          rowActions={rows.map(row => (
            <div key={row.id} className="flex items-center justify-end gap-2">
              <Link href={`/hrm/employees/${row.id}`}>
                <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
              </Link>
              <Link href={`/hrm/employees/${row.id}/edit`}>
                <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
              </Link>
            </div>
          ))}
        />
      </div>
    </div>
  );
}
