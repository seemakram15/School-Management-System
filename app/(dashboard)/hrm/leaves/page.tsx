import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const leaveStatusMap = { 0: "Pending", 1: "Approved", 2: "Rejected" } as const;
const leaveStatusVariant = { 0: "warning", 1: "success", 2: "danger" } as const;

export default async function LeavesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leaves")
    .select("id, apply_date, from_date, to_date, total_days, reason, status, employees(name, id_card)")
    .order("apply_date", { ascending: false });

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Leave Requests</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total requests</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["reason"]}
          columns={[
            {
              key: "employees", label: "Employee",
              render: r => {
                const emp = (r as unknown as { employees: { name: string; id_card: string } | null }).employees;
                return emp ? `${emp.name} (${emp.id_card})` : "-";
              },
            },
            { key: "apply_date", label: "Applied", render: r => formatDate(r.apply_date) },
            { key: "from_date", label: "From", render: r => formatDate(r.from_date) },
            { key: "to_date", label: "To", render: r => formatDate(r.to_date) },
            { key: "total_days", label: "Days" },
            { key: "reason", label: "Reason", render: r => r.reason || "-" },
            {
              key: "status", label: "Status",
              render: r => (
                <Badge variant={leaveStatusVariant[r.status as 0 | 1 | 2]}>
                  {leaveStatusMap[r.status as 0 | 1 | 2]}
                </Badge>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
