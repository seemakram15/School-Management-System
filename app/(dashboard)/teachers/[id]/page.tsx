import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, GENDER, RELIGION } from "@/lib/utils";
import PublicProfileForm from "./PublicProfileForm";

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: employee } = await supabase
    .from("employees")
    .select("id, name, designation, qualification, dob, gender, religion, blood_group, nationality, email, phone_no, id_card, role_id, joining_date, shift, duty_start, duty_end, address, extra_activity, note, photo, status")
    .eq("id", parseInt(id))
    .eq("role_id", 3)
    .single();

  if (!employee) notFound();

  const { data: profile } = await supabase
    .from("teacher_profiles")
    .select("employee_id, about, facebook, twitter, linkedin, subject_id")
    .eq("employee_id", employee.id)
    .maybeSingle();

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
          <Link href="/teachers" className="hover:text-foreground">Teachers</Link>
          <span>/</span>
          <span className="text-foreground">Profile</span>
        </nav>
        <Link href={`/teachers/${id}/edit`}>
          <Button size="sm" variant="outline">Edit Info</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 text-center space-y-3">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-muted">
              <img src={employee.photo ? `/storage/employee/${employee.photo}` : "/images/avatar.jpg"} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.designation}</p>
            </div>
            <ul className="text-sm space-y-2 text-left border-t border-border pt-3">
              <li className="flex justify-between"><span className="font-medium">Employee ID</span><span className="text-muted-foreground font-mono text-xs">{employee.id_card}</span></li>
              <li className="flex justify-between"><span className="font-medium">Email</span><span className="text-muted-foreground truncate ml-2">{employee.email ?? "—"}</span></li>
              <li className="flex justify-between"><span className="font-medium">Phone</span><span className="text-muted-foreground">{employee.phone_no ?? "—"}</span></li>
              <li className="flex justify-between"><span className="font-medium">Joined</span><span className="text-muted-foreground">{formatDate(employee.joining_date)}</span></li>
              <li className="flex justify-between items-center"><span className="font-medium">Status</span>
                <Badge variant={employee.status === 1 ? "success" : "danger"}>{employee.status === 1 ? "Active" : "Inactive"}</Badge>
              </li>
            </ul>
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <p className="text-sm font-semibold text-primary border-b border-border pb-1 mb-3">Personal Info</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
              <InfoRow label="Date of Birth" value={formatDate(employee.dob)} />
              <InfoRow label="Gender" value={GENDER[String(employee.gender)] ?? employee.gender} />
              <InfoRow label="Religion" value={RELIGION[String(employee.religion)] ?? employee.religion} />
              <InfoRow label="Blood Group" value={employee.blood_group} />
              <InfoRow label="Nationality" value={employee.nationality} />
              <InfoRow label="Qualification" value={employee.qualification} />
              <InfoRow label="Shift" value={employee.shift} />
              <InfoRow label="Address" value={employee.address} />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <p className="text-sm font-semibold text-primary border-b border-border pb-1 mb-3">Public Profile</p>
            <PublicProfileForm employeeId={employee.id} profile={profile ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}
