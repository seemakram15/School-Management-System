import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StudentStatusToggle from "@/components/students/StudentStatusToggle";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ class_id?: string; section_id?: string; status?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const classId = sp.class_id;
  const sectionId = sp.section_id;
  const status = sp.status ?? "1";

  const { data: classes } = await supabase.from("i_classes").select("id, name").eq("status", 1).order("numeric_value");
  const { data: sections } = await supabase.from("sections").select("id, name, class_id").eq("status", 1);

  let query = supabase
    .from("registrations")
    .select("id, regi_no, roll_no, card_no, is_promoted, status, students(id, name, phone_no, email, photo), i_classes(name), sections(name)")
    .eq("status", parseInt(status));

  if (classId) query = query.eq("class_id", classId);
  if (sectionId) query = query.eq("section_id", sectionId);

  const { data: students } = await query.order("roll_no");

  const filteredSections = classId
    ? (sections ?? []).filter(s => String(s.class_id) === classId)
    : (sections ?? []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">Manage student registrations</p>
        </div>
        <Link href="/students/new">
          <Button size="sm">+ Add New</Button>
        </Link>
      </div>

      <form method="GET" className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Class</label>
            <select name="class_id" defaultValue={classId} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Classes</option>
              {(classes ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Section</label>
            <select name="section_id" defaultValue={sectionId} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Sections</option>
              {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Status</label>
            <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline">Filter</Button>
        </div>
      </form>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground w-10">#</th>
                <th className="text-left p-3 font-medium text-muted-foreground w-14">Photo</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Regi. No.</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Roll No.</th>
                <th className="text-left p-3 font-medium text-muted-foreground">ID Card</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Class / Section</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Phone No.</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {!(students ?? []).length && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-muted-foreground">
                    No students found.{" "}
                    <Link href="/students/new" className="text-primary hover:underline">Add the first student.</Link>
                  </td>
                </tr>
              )}
              {(students ?? []).map((reg, i) => {
                const s = reg.students as unknown as { name: string; phone_no: string; photo: string | null };
                const cls = reg.i_classes as unknown as { name: string } | null;
                const sec = reg.sections as unknown as { name: string } | null;
                return (
                  <tr key={reg.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3">
                      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden">
                        <img src={s?.photo ? `/storage/student/${s.photo}` : "/images/avatar.jpg"} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs">{reg.regi_no}</td>
                    <td className="p-3">{reg.roll_no ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{reg.card_no ?? "—"}</td>
                    <td className="p-3 font-medium">{s?.name}</td>
                    <td className="p-3 text-muted-foreground">{cls?.name ?? "—"} / {sec?.name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{s?.phone_no || "—"}</td>
                    <td className="p-3">
                      <StudentStatusToggle id={reg.id} initialStatus={reg.status === 1} />
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <Link href={`/students/${reg.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">View</Button>
                        </Link>
                        {!reg.is_promoted && (
                          <Link href={`/students/${reg.id}/edit`}>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Edit</Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          {(students ?? []).length} student{(students ?? []).length !== 1 ? "s" : ""} found
        </div>
      </div>
    </div>
  );
}
