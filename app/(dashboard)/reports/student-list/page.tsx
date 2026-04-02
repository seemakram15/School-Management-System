import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { GENDER, formatDate } from "@/lib/utils";

export default async function StudentListReportPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, name, email, phone_no, gender, dob, status, registrations(i_classes(name), sections(name), academic_years(title, is_running))")
    .is("deleted_at", null)
    .eq("status", 1)
    .order("name");

  type StudentRow = { id: number; name: string; email: string | null; phone_no: string | null; gender: number | null; dob: string | null; status: number | null; registrations: Array<{ i_classes: { name: string } | null; sections: { name: string } | null; academic_years: { title: string; is_running: boolean } | null }> | null };
  const rows = ((data ?? []) as unknown as StudentRow[]).map(s => {
    const reg = s.registrations?.find(r => r.academic_years?.is_running);
    return { ...s, class: reg?.i_classes?.name ?? "-", section: reg?.sections?.name ?? "-", year: reg?.academic_years?.title ?? "-" };
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Student List Report</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All active students</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name", "email"]}
          columns={[
            { key: "name", label: "Name" },
            { key: "class", label: "Class" },
            { key: "section", label: "Section" },
            { key: "year", label: "Academic Year" },
            { key: "gender", label: "Gender" },
            { key: "dob", label: "DOB" },
            { key: "phone_no", label: "Phone" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            name: r.name,
            class: r.class,
            section: r.section,
            year: r.year,
            gender: GENDER[String(r.gender)] ?? r.gender,
            dob: formatDate(r.dob),
            phone_no: r.phone_no || "-",
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
        />
      </div>
    </div>
  );
}
