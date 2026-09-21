import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ATTENDANCE_STATUS } from "@/lib/utils";

export default async function EmployeeAttendancePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("employee_attendances")
    .select("id, attendance_date, attendance, note, employees(name, id_card)")
    .eq("attendance_date", today)
    .order("attendance_date", { ascending: false })
    .limit(50);

  type AttRow = { id: number; attendance_date: string; attendance: number; note: string | null; employees: { name: string; id_card: string | null } | null };
  const rows = (data ?? []) as unknown as AttRow[];
  const present = rows.filter(r => r.attendance === 1).length;
  const absent = rows.filter(r => r.attendance === 0).length;
  const late = rows.filter(r => r.attendance === 2).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Employee Attendance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Today: {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Link href="/attendance/employees/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Attendance</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Present", count: present, color: "text-green-600 bg-green-50 dark:bg-green-950" },
          { label: "Absent", count: absent, color: "text-red-600 bg-red-50 dark:bg-red-950" },
          { label: "Late", count: late, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Today's Records ({rows.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {["Employee", "ID Card", "Status", "Note"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No attendance recorded today</td></tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{row.employees?.name ?? "-"}</td>
                    <td className="px-4 py-3">{row.employees?.id_card ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={row.attendance === 1 ? "success" : row.attendance === 2 ? "warning" : "danger"}>
                        {ATTENDANCE_STATUS[row.attendance as 0 | 1 | 2]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.note ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
