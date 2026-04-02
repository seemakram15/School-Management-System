import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { ATTENDANCE_STATUS, formatDate } from "@/lib/utils";

export default async function StudentAttendanceReportPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_attendances")
    .select("id, attendance_date, attendance, note, registrations(students(name), i_classes(name), sections(name))")
    .order("attendance_date", { ascending: false })
    .limit(100);

  type AttRow = { id: number; attendance_date: string; attendance: number; note: string | null; registrations: { students: { name: string } | null; i_classes: { name: string } | null; sections: { name: string } | null } | null };
  const rows = (data ?? []) as unknown as AttRow[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Student Attendance Report</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Most recent 100 records</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={[]}
          columns={[
            { key: "date", label: "Date", render: r => formatDate(r.attendance_date) },
            { key: "student", label: "Student", render: r => r.registrations?.students?.name ?? "-" },
            { key: "class", label: "Class", render: r => r.registrations?.i_classes?.name ?? "-" },
            { key: "section", label: "Section", render: r => r.registrations?.sections?.name ?? "-" },
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
