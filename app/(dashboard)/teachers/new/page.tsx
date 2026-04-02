"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GENDER, RELIGION } from "@/lib/utils";

// ponytail: teacher role id kept as the same hardcoded 3 used in app/(dashboard)/teachers/page.tsx;
// resolve dynamically via roles table lookup if that convention ever changes.
const TEACHER_ROLE_ID = 3;
const EMP_SHIFTS = { "Morning": "Morning", "Day": "Day", "Evening": "Evening" };

export default function TeacherNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", qualification: "", dob: "", gender: "", religion: "",
    blood_group: "", nationality: "Bangladeshi", email: "", phone_no: "", id_card: "",
    joining_date: "", shift: "", duty_start: "", duty_end: "",
    address: "", extra_activity: "", note: "", sms_receive_no: "0",
    father_name: "", father_phone_no: "", mother_name: "", mother_phone_no: "",
    guardian: "", guardian_phone_no: "", present_address: "", permanent_address: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, designation: "Teacher", role_id: TEACHER_ROLE_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Teacher added successfully");
      router.push("/teachers");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Teacher</h2>
          <p className="text-sm text-muted-foreground">Add New Teacher</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/teachers" className="hover:text-foreground">Teachers</Link>
          <span>/</span>
          <span className="text-foreground">Add</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Personal Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Name *">
              <Input name="name" value={form.name} onChange={set("name")} placeholder="Full name" required minLength={2} maxLength={255} />
            </FormField>
            <FormField label="Qualification">
              <Input name="qualification" value={form.qualification} onChange={set("qualification")} placeholder="MA, BA, B.Sc" maxLength={255} />
            </FormField>
            <FormField label="Date of Birth *">
              <Input type="date" name="dob" value={form.dob} onChange={set("dob")} required />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Gender *">
              <Select name="gender" value={form.gender} onChange={set("gender")} required>
                <option value="">Select gender</option>
                {Object.entries(GENDER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormField>
            <FormField label="Religion *">
              <Select name="religion" value={form.religion} onChange={set("religion")} required>
                <option value="">Select religion</option>
                {Object.entries(RELIGION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormField>
            <FormField label="Email">
              <Input type="email" name="email" value={form.email} onChange={set("email")} placeholder="email@example.com" maxLength={100} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Phone / Mobile No. *">
              <Input name="phone_no" value={form.phone_no} onChange={set("phone_no")} placeholder="+880..." required maxLength={15} />
            </FormField>
            <FormField label="ID Card No. / Employee ID *">
              <Input name="id_card" value={form.id_card} onChange={set("id_card")} placeholder="Employee ID" required maxLength={50} />
            </FormField>
          </div>
        </div>

        {/* Job Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Job Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Joining Date *">
              <Input type="date" name="joining_date" value={form.joining_date} onChange={set("joining_date")} required />
            </FormField>
            <FormField label="Shift *">
              <Select name="shift" value={form.shift} onChange={set("shift")} required>
                <option value="">Pick a shift...</option>
                {Object.entries(EMP_SHIFTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Duty Start Time">
              <Input type="time" name="duty_start" value={form.duty_start} onChange={set("duty_start")} />
            </FormField>
            <FormField label="Duty End Time">
              <Input type="time" name="duty_end" value={form.duty_end} onChange={set("duty_end")} />
            </FormField>
          </div>
          <FormField label="Address">
            <Textarea name="address" value={form.address} onChange={set("address")} maxLength={500} rows={3} />
          </FormField>
        </div>

        {/* Guardian Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Guardian / Family Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Father Name">
              <Input name="father_name" value={form.father_name} onChange={set("father_name")} maxLength={255} />
            </FormField>
            <FormField label="Father Phone No.">
              <Input name="father_phone_no" value={form.father_phone_no} onChange={set("father_phone_no")} maxLength={15} />
            </FormField>
            <FormField label="Mother Name">
              <Input name="mother_name" value={form.mother_name} onChange={set("mother_name")} maxLength={255} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Mother Phone No.">
              <Input name="mother_phone_no" value={form.mother_phone_no} onChange={set("mother_phone_no")} maxLength={15} />
            </FormField>
            <FormField label="Guardian">
              <Input name="guardian" value={form.guardian} onChange={set("guardian")} maxLength={255} />
            </FormField>
            <FormField label="Guardian Phone No.">
              <Input name="guardian_phone_no" value={form.guardian_phone_no} onChange={set("guardian_phone_no")} maxLength={15} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Present Address">
              <Textarea name="present_address" value={form.present_address} onChange={set("present_address")} rows={3} maxLength={500} />
            </FormField>
            <FormField label="Permanent Address">
              <Textarea name="permanent_address" value={form.permanent_address} onChange={set("permanent_address")} rows={3} maxLength={500} />
            </FormField>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teachers"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="ml-auto">
            {loading ? "Saving..." : "+ Add Teacher"}
          </Button>
        </div>
      </form>
    </div>
  );
}
