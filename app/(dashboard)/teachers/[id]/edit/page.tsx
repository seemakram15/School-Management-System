import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EmployeeEditForm from "@/app/(dashboard)/hrm/employees/[id]/edit/EmployeeEditForm";

export default async function TeacherEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("id, name, designation, qualification, dob, gender, religion, blood_group, nationality, email, phone_no, id_card, role_id, joining_date, shift, duty_start, duty_end, address, extra_activity, note, sms_receive_no, father_name, father_phone_no, mother_name, mother_phone_no, guardian, guardian_phone_no, present_address, permanent_address, status")
    .eq("id", parseInt(id))
    .eq("role_id", 3)
    .single();

  if (!data) notFound();

  return <EmployeeEditForm employee={data} />;
}
