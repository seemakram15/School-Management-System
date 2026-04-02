import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import LeaveActions from "./LeaveActions";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Leave Requests</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total requests</p>
        </div>
        <Link href="/hrm/leaves/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Apply for Leave</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["reason"]}
          columns={[
            { key: "employees", label: "Employee" },
            { key: "apply_date", label: "Applied" },
            { key: "from_date", label: "From" },
            { key: "to_date", label: "To" },
            { key: "total_days", label: "Days" },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => {
            const emp = (r as unknown as { employees: { name: string; id_card: string } | null }).employees;
            return {
              employees: emp ? `${emp.name} (${emp.id_card})` : "-",
              apply_date: formatDate(r.apply_date),
              from_date: formatDate(r.from_date),
              to_date: formatDate(r.to_date),
              total_days: r.total_days,
              reason: r.reason || "-",
              status: (
                <Badge variant={leaveStatusVariant[r.status as 0 | 1 | 2]}>
                  {leaveStatusMap[r.status as 0 | 1 | 2]}
                </Badge>
              ),
            };
          })}
          rowActions={rows.map(row => (
            row.status === 0 ? <LeaveActions key={row.id} id={row.id} /> : <div key={row.id} />
          ))}
        />
      </div>
    </div>
  );
}
