import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import StudentEditForm, { StudentEditFormValues } from "@/components/students/StudentEditForm";

export default async function StudentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  type RegRow = {
    id: number; roll_no: string | null; card_no: string | null; board_regi_no: string | null;
    shift: string | null; house: string | null; student_id: number;
    students: Record<string, unknown> | null;
  };

  const { data: regRaw } = await supabase
    .from("registrations")
    .select("id, roll_no, card_no, board_regi_no, shift, house, student_id, students(*)")
    .eq("id", parseInt(id))
    .single();

  if (!regRaw) notFound();
  const reg = regRaw as unknown as RegRow;
  const student = reg.students ?? {};

  const initial: StudentEditFormValues = {
    name: String(student.name ?? ""),
    nick_name: String(student.nick_name ?? ""),
    dob: String(student.dob ?? ""),
    gender: String(student.gender ?? ""),
    religion: String(student.religion ?? ""),
    blood_group: String(student.blood_group ?? ""),
    email: String(student.email ?? ""),
    phone_no: String(student.phone_no ?? ""),
    extra_activity: String(student.extra_activity ?? ""),
    note: String(student.note ?? ""),
    father_name: String(student.father_name ?? ""),
    father_phone_no: String(student.father_phone_no ?? ""),
    mother_name: String(student.mother_name ?? ""),
    mother_phone_no: String(student.mother_phone_no ?? ""),
    guardian: String(student.guardian ?? ""),
    guardian_phone_no: String(student.guardian_phone_no ?? ""),
    present_address: String(student.present_address ?? ""),
    permanent_address: String(student.permanent_address ?? ""),
    sms_receive_no: String(student.sms_receive_no ?? "0"),
    siblings: String(student.siblings ?? ""),
    shift: reg.shift ?? "",
    card_no: reg.card_no ?? "",
    roll_no: reg.roll_no ?? "",
    board_regi_no: reg.board_regi_no ?? "",
    house: reg.house ?? "",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Student</h2>
          <p className="text-sm text-muted-foreground">Edit Student</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/students" className="hover:text-foreground">Students</Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </nav>
      </div>

      <StudentEditForm registrationId={reg.id} initial={initial} />
    </div>
  );
}
