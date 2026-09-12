import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, GENDER, RELIGION } from "@/lib/utils";
import StudentTabs from "@/components/students/StudentTabs";

const SMS_LABELS: Record<number, string> = { 0: "None", 1: "Father's Phone", 2: "Mother's Phone", 3: "Guardian's Phone", 4: "Student's Phone" };

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  type RegRow = { id: number; regi_no: string; roll_no: string | null; card_no: string | null; board_regi_no: string | null; shift: string | null; status: number; is_promoted: boolean | null; house: string | null; student_id: number; class_id: number; section_id: number; academic_year_id: number; students: Record<string, unknown> | null; i_classes: { name: string } | null; sections: { name: string } | null; academic_years: { title: string } | null };
  const { data: regRaw } = await supabase
    .from("registrations")
    .select("id, regi_no, roll_no, card_no, board_regi_no, shift, status, is_promoted, house, student_id, class_id, section_id, academic_year_id, students(*), i_classes(name), sections(name), academic_years(title)")
    .eq("id", parseInt(id))
    .single();

  if (!regRaw) notFound();
  const reg = regRaw as unknown as RegRow;

  const student = reg.students ?? {};
  const cls = reg.i_classes;
  const sec = reg.sections;
  const acYear = reg.academic_years;

  const InfoRow = ({ label, value }: { label: string; value: unknown }) => (
    <>
      <div className="col-span-1 text-sm font-medium text-muted-foreground">{label}</div>
      <div className="col-span-1 text-sm text-foreground">: {String(value ?? "—")}</div>
    </>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/students" className="hover:text-foreground">Students</Link>
          <span>/</span>
          <span className="text-foreground">Profile</span>
        </nav>
        <div className="flex gap-2">
          {!reg.is_promoted && (
            <Link href={`/students/${id}/edit`}>
              <Button size="sm" variant="outline">Edit</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 text-center space-y-3">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-muted">
              <img src={(student?.photo as string) ? `/storage/student/${student.photo}` : "/images/avatar.jpg"} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{String(student?.name)}</h3>
              <p className="text-sm text-muted-foreground">{cls?.name}</p>
            </div>
            <ul className="text-sm space-y-2 text-left border-t border-border pt-3">
              <li className="flex justify-between"><span className="font-medium">Reg. No.</span><span className="text-muted-foreground font-mono text-xs">{reg.regi_no}</span></li>
              <li className="flex justify-between"><span className="font-medium">ID Card</span><span className="text-muted-foreground">{reg.card_no ?? "—"}</span></li>
              <li className="flex justify-between"><span className="font-medium">Phone</span><span className="text-muted-foreground">{String(student?.phone_no ?? "—")}</span></li>
              <li className="flex justify-between items-center"><span className="font-medium">Status</span>
                <Badge variant={reg.status === 1 ? "success" : "danger"}>{reg.status === 1 ? "Active" : "Inactive"}</Badge>
              </li>
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="lg:col-span-3">
          <StudentTabs registrationId={reg.id}>
            <div className="space-y-5 p-1">
              <div>
                <p className="text-sm font-semibold text-primary border-b border-border pb-1 mb-3">Personal Info</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                  <InfoRow label="Full Name" value={`${student?.name}${student?.nick_name ? ` [${student.nick_name}]` : ""}`} />
                  <InfoRow label="Date of Birth" value={formatDate(student?.dob as string)} />
                  <InfoRow label="Gender" value={GENDER[String(student?.gender)] ?? student?.gender} />
                  <InfoRow label="Religion" value={RELIGION[String(student?.religion)] ?? student?.religion} />
                  <InfoRow label="Blood Group" value={student?.blood_group} />
                  <InfoRow label="Nationality" value={student?.nationality} />
                  <InfoRow label="Email" value={student?.email} />
                  <InfoRow label="Phone No." value={student?.phone_no} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary border-b border-border pb-1 mb-3">Parents Info</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                  <InfoRow label="Father Name" value={student?.father_name} />
                  <InfoRow label="Father Phone" value={student?.father_phone_no} />
                  <InfoRow label="Mother Name" value={student?.mother_name} />
                  <InfoRow label="Mother Phone" value={student?.mother_phone_no} />
                  <InfoRow label="Guardian" value={student?.guardian} />
                  <InfoRow label="Guardian Phone" value={student?.guardian_phone_no} />
                  <InfoRow label="Present Address" value={student?.present_address} />
                  <InfoRow label="Permanent Address" value={student?.permanent_address} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary border-b border-border pb-1 mb-3">Academic Info</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                  <InfoRow label="Academic Year" value={acYear?.title} />
                  <InfoRow label="Registration No." value={reg.regi_no} />
                  <InfoRow label="Class" value={cls?.name} />
                  <InfoRow label="Section" value={sec?.name} />
                  <InfoRow label="Roll No." value={reg.roll_no} />
                  <InfoRow label="Shift" value={reg.shift} />
                  <InfoRow label="Board Reg. No." value={reg.board_regi_no} />
                  <InfoRow label="Card No." value={reg.card_no} />
                  <InfoRow label="SMS Notification" value={SMS_LABELS[Number(student?.sms_receive_no)] ?? "None"} />
                  <InfoRow label="Siblings" value={student?.siblings} />
                </div>
              </div>
            </div>
          </StudentTabs>
        </div>
      </div>
    </div>
  );
}
