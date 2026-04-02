import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { ATTENDANCE_STATUS, formatDate } from "@/lib/utils";

export default async function EmployeeAttendanceReportPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employee_attendances")
    .select("id, attendance_date, attendance, note, employees(name, id_card)")
    .order("attendance_date", { ascending: false })
    .limit(100);

  type AttRow = { id: number; attendance_date: string; attendance: number; note: string | null; employees: { name: string; id_card: string | null } | null };
  const rows = (data ?? []) as unknown as AttRow[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Employee Attendance Report</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Most recent 100 records</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={[]}
          columns={[
            { key: "date", label: "Date", render: r => formatDate(r.attendance_date) },
            { key: "employee", label: "Employee", render: r => r.employees?.name ?? "-" },
            { key: "id_card", label: "ID Card", render: r => r.employees?.id_card ?? "-" },
            {
              key: "status", label: "Status",
              render: r => (
                <Badge variant={r.attendance === 1 ? "success" : r.attendance === 2 ? "warning" : "danger"}>
                  {ATTENDANCE_STATUS[r.attendance as 0 | 1 | 2]}
                </Badge>
              ),
            },
            { key: "note", label: "Note", render: r => r.note ?? "-" },
          ]}
        />
      </div>
    </div>
  );
}
