import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function MarksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marks")
    .select("id, marks, registrations(students(name)), exams(name), subjects(name)")
    .order("id", { ascending: false })
    .limit(100);

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Marks Entry</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Student exam marks</p>
        </div>
        <Link href="/marks/entry">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Enter Marks</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={[]}
          columns={[
            {
              key: "registrations", label: "Student",
              render: r => (r as unknown as { registrations: { students: { name: string } | null } | null }).registrations?.students?.name ?? "-",
            },
            {
              key: "exams", label: "Exam",
              render: r => (r as unknown as { exams: { name: string } | null }).exams?.name ?? "-",
            },
            {
              key: "subjects", label: "Subject",
              render: r => (r as unknown as { subjects: { name: string } | null }).subjects?.name ?? "-",
            },
            { key: "marks", label: "Marks" },
          ]}
        />
      </div>
    </div>
  );
}
