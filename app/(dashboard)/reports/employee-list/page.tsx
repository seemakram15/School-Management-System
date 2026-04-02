import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function EmployeeListReportPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("id, name, id_card, email, phone_no, gender, designation, joining_date, status, roles:role_id(name)")
    .is("deleted_at", null)
    .order("name");

  type EmployeeRow = { id: number; name: string; id_card: string | null; email: string | null; phone_no: string | null; gender: number | null; designation: string | null; joining_date: string | null; status: number | null; roles: { name: string } | null };
  const rows = (data ?? []) as unknown as EmployeeRow[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Employee List Report</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All employees</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name", "email", "id_card"]}
          columns={[
            { key: "id_card", label: "ID Card", render: r => r.id_card ?? "-" },
            { key: "name", label: "Name" },
            { key: "role", label: "Role", render: r => r.roles?.name ?? "-" },
            { key: "designation", label: "Designation", render: r => r.designation ?? "-" },
            { key: "email", label: "Email", render: r => r.email || "-" },
            { key: "phone_no", label: "Phone", render: r => r.phone_no || "-" },
            { key: "joining_date", label: "Joined", render: r => formatDate(r.joining_date) },
            {
              key: "status", label: "Status",
              render: r => <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
            },
          ]}
        />
      </div>
    </div>
  );
}
