"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GENDER, RELIGION, BLOOD_GROUP, SHIFT } from "@/lib/utils";

const SMS_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Father's Phone" },
  { value: "2", label: "Mother's Phone" },
  { value: "3", label: "Guardian's Phone" },
  { value: "4", label: "Student's Phone" },
];

export interface StudentEditFormValues {
  name: string; nick_name: string; dob: string; gender: string; religion: string; blood_group: string;
  email: string; phone_no: string; extra_activity: string; note: string;
  father_name: string; father_phone_no: string; mother_name: string; mother_phone_no: string;
  guardian: string; guardian_phone_no: string; present_address: string; permanent_address: string;
  sms_receive_no: string; siblings: string;
  shift: string; card_no: string; roll_no: string; board_regi_no: string; house: string;
}

export default function StudentEditForm({ registrationId, initial }: { registrationId: number; initial: StudentEditFormValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);

  const set = (k: keyof StudentEditFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Student updated successfully");
      router.push("/students");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Info */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Student Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Name *">
            <Input name="name" value={form.name} onChange={set("name")} placeholder="Full name" required minLength={5} maxLength={255} />
          </FormField>
          <FormField label="Nick Name">
            <Input name="nick_name" value={form.nick_name} onChange={set("nick_name")} placeholder="For SMS notifications" maxLength={50} />
          </FormField>
          <FormField label="Date of Birth *">
            <Input type="date" name="dob" value={form.dob} onChange={set("dob")} required />
          </FormField>
          <FormField label="Gender *">
            <Select name="gender" value={form.gender} onChange={set("gender")} required>
              <option value="">Select gender</option>
              {Object.entries(GENDER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Religion *">
            <Select name="religion" value={form.religion} onChange={set("religion")} required>
              <option value="">Select religion</option>
              {Object.entries(RELIGION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FormField>
          <FormField label="Blood Group">
            <Select name="blood_group" value={form.blood_group} onChange={set("blood_group")}>
              <option value="">Select blood group</option>
              {Object.entries(BLOOD_GROUP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Email">
            <Input type="email" name="email" value={form.email} onChange={set("email")} placeholder="email@example.com" maxLength={100} />
          </FormField>
          <FormField label="Phone / Mobile No.">
            <Input name="phone_no" value={form.phone_no} onChange={set("phone_no")} placeholder="+880..." maxLength={15} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Extra Curricular Activity">
            <Textarea name="extra_activity" value={form.extra_activity} onChange={set("extra_activity")} maxLength={255} rows={3} />
          </FormField>
          <FormField label="Note">
            <Textarea name="note" value={form.note} onChange={set("note")} maxLength={500} rows={3} />
          </FormField>
        </div>
      </div>

      {/* Guardian Info */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Guardian Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Father Name">
            <Input name="father_name" value={form.father_name} onChange={set("father_name")} placeholder="Father's full name" maxLength={255} />
          </FormField>
          <FormField label="Father Phone No.">
            <Input name="father_phone_no" value={form.father_phone_no} onChange={set("father_phone_no")} placeholder="+880..." maxLength={15} />
          </FormField>
          <FormField label="Mother Name">
            <Input name="mother_name" value={form.mother_name} onChange={set("mother_name")} placeholder="Mother's full name" maxLength={255} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Mother Phone No.">
            <Input name="mother_phone_no" value={form.mother_phone_no} onChange={set("mother_phone_no")} placeholder="+880..." maxLength={15} />
          </FormField>
          <FormField label="Local Guardian">
            <Input name="guardian" value={form.guardian} onChange={set("guardian")} placeholder="Guardian name" maxLength={255} />
          </FormField>
          <FormField label="Guardian Phone No.">
            <Input name="guardian_phone_no" value={form.guardian_phone_no} onChange={set("guardian_phone_no")} placeholder="+880..." maxLength={15} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Present Address">
            <Textarea name="present_address" value={form.present_address} onChange={set("present_address")} maxLength={500} rows={3} />
          </FormField>
          <FormField label="Permanent Address *">
            <Textarea name="permanent_address" value={form.permanent_address} onChange={set("permanent_address")} required maxLength={500} rows={3} />
          </FormField>
        </div>
      </div>

      {/* Academic Info */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Academic Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Shift *">
            <Select name="shift" value={form.shift} onChange={set("shift")} required>
              <option value="">Pick a shift...</option>
              {Object.entries(SHIFT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FormField>
          <FormField label="Roll No.">
            <Input type="number" name="roll_no" value={form.roll_no} onChange={set("roll_no")} placeholder="Roll number" />
          </FormField>
          <FormField label="ID Card No.">
            <Input name="card_no" value={form.card_no} onChange={set("card_no")} placeholder="ID card number" maxLength={50} />
          </FormField>
          <FormField label="Board Registration No.">
            <Input name="board_regi_no" value={form.board_regi_no} onChange={set("board_regi_no")} placeholder="Board reg. number" maxLength={20} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="House">
            <Input name="house" value={form.house} onChange={set("house")} placeholder="House name" maxLength={100} />
          </FormField>
          <FormField label="Notification SMS No. *">
            <Select name="sms_receive_no" value={form.sms_receive_no} onChange={set("sms_receive_no")} required>
              {SMS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Siblings (Registration Nos.)">
            <Input name="siblings" value={form.siblings} onChange={set("siblings")} placeholder="1901004,1909201" maxLength={255} />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/students">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={loading} className="ml-auto">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
