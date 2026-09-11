"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GENDER, RELIGION, BLOOD_GROUP, SHIFT } from "@/lib/utils";

interface IClass { id: number; name: string; have_selective_subject: boolean; max_selective_subject: number; have_elective_subject: boolean; }
interface Section { id: number; name: string; }
interface Subject { id: number; name: string; code: string; type: string; }

const SMS_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Father's Phone" },
  { value: "2", label: "Mother's Phone" },
  { value: "3", label: "Guardian's Phone" },
  { value: "4", label: "Student's Phone" },
];

export default function StudentNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [coreSubjects, setCoreSubjects] = useState<Subject[]>([]);
  const [selectiveSubjects, setSelectiveSubjects] = useState<Subject[]>([]);
  const [electiveSubjects, setElectiveSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [nationality, setNationality] = useState("Bangladeshi");

  const [form, setForm] = useState({
    name: "", nick_name: "", dob: "", gender: "", religion: "", blood_group: "",
    nationality_other: "", email: "", phone_no: "", extra_activity: "", note: "",
    father_name: "", father_phone_no: "", mother_name: "", mother_phone_no: "",
    guardian: "", guardian_phone_no: "", present_address: "", permanent_address: "",
    section_id: "", shift: "", card_no: "", roll_no: "", board_regi_no: "", sms_receive_no: "0",
    siblings: "", house: "",
    core_subjects: [] as string[], selective_subjects: [] as string[], fourth_subject: "",
    username: "", password: "",
  });

  useEffect(() => {
    fetch("/api/academic/classes").then(r => r.json()).then(setClasses);
  }, []);

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c.id === parseInt(classId)) || null;
    setSelectedClass(cls);
    form.section_id = "";
    form.core_subjects = [];
    form.selective_subjects = [];
    form.fourth_subject = "";

    const [secs, core, selective, elective] = await Promise.all([
      fetch(`/api/academic/sections?class_id=${classId}`).then(r => r.json()),
      fetch(`/api/academic/subjects?class_id=${classId}&type=core`).then(r => r.json()),
      fetch(`/api/academic/subjects?class_id=${classId}&type=selective`).then(r => r.json()),
      fetch(`/api/academic/subjects?class_id=${classId}&type=elective`).then(r => r.json()),
    ]);
    setSections(secs);
    setCoreSubjects(core);
    setSelectiveSubjects(selective);
    setElectiveSubjects(elective);
    setForm(f => ({ ...f, core_subjects: core.map((s: Subject) => String(s.id)) }));
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        nationality: nationality === "Other" ? form.nationality_other : nationality,
        class_id: parseInt(selectedClassId),
        core_subjects: form.core_subjects.map(Number),
        selective_subjects: form.selective_subjects.map(Number),
        fourth_subject: form.fourth_subject ? parseInt(form.fourth_subject) : null,
      };
      const res = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success(`Student added. Registration No: ${data.regi_no}`);
      router.push("/students");
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
          <h2 className="text-xl font-bold text-foreground">Student</h2>
          <p className="text-sm text-muted-foreground">Add New Student</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/students" className="hover:text-foreground">Students</Link>
          <span>/</span>
          <span className="text-foreground">Add</span>
        </nav>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
        <b>Note:</b> Create a class and section before adding a new student. And a subject if the student has an elective subject.
      </div>

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
            <FormField label="Nationality *">
              <Select name="nationality" value={nationality} onChange={e => setNationality(e.target.value)} required>
                <option value="Bangladeshi">Bangladeshi</option>
                <option value="Other">Other</option>
              </Select>
            </FormField>
            {nationality === "Other" && (
              <FormField label="Nationality (specify)">
                <Input name="nationality_other" value={form.nationality_other} onChange={set("nationality_other")} placeholder="Enter nationality" maxLength={50} />
              </FormField>
            )}
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
            <FormField label="Class *">
              <Select value={selectedClassId} onChange={e => handleClassChange(e.target.value)} required>
                <option value="">Pick a class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Section *">
              <Select name="section_id" value={form.section_id} onChange={set("section_id")} required disabled={!selectedClassId}>
                <option value="">Pick a section...</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Shift *">
              <Select name="shift" value={form.shift} onChange={set("shift")} required>
                <option value="">Pick a shift...</option>
                {Object.entries(SHIFT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormField>
            <FormField label="Roll No.">
              <Input type="number" name="roll_no" value={form.roll_no} onChange={set("roll_no")} placeholder="Roll number" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="ID Card No.">
              <Input name="card_no" value={form.card_no} onChange={set("card_no")} placeholder="ID card number" maxLength={50} />
            </FormField>
            <FormField label="Board Registration No.">
              <Input name="board_regi_no" value={form.board_regi_no} onChange={set("board_regi_no")} placeholder="Board reg. number" maxLength={20} />
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

        {/* Subject Info */}
        {selectedClassId && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
            <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Subject Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Core Subjects *">
                <div className="border border-border rounded-md p-2 space-y-1 bg-muted/30 min-h-[80px]">
                  {coreSubjects.length ? coreSubjects.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-default">
                      <input type="checkbox" checked className="accent-primary" readOnly />
                      {s.name} ({s.code})
                    </label>
                  )) : <p className="text-xs text-muted-foreground">No core subjects defined</p>}
                </div>
              </FormField>
              {selectedClass?.have_selective_subject && (
                <FormField label={`Selective Subjects (max ${selectedClass.max_selective_subject})`}>
                  <div className="border border-border rounded-md p-2 space-y-1 min-h-[80px] overflow-y-auto max-h-48">
                    {selectiveSubjects.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={form.selective_subjects.includes(String(s.id))}
                          onChange={e => {
                            setForm(f => ({
                              ...f,
                              selective_subjects: e.target.checked
                                ? [...f.selective_subjects, String(s.id)]
                                : f.selective_subjects.filter(x => x !== String(s.id)),
                            }));
                          }}
                        />
                        {s.name} ({s.code})
                      </label>
                    ))}
                  </div>
                </FormField>
              )}
              {selectedClass?.have_elective_subject && (
                <FormField label="4th / Elective Subject">
                  <Select name="fourth_subject" value={form.fourth_subject} onChange={set("fourth_subject")}>
                    <option value="">Select a subject</option>
                    {electiveSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </FormField>
              )}
            </div>
          </div>
        )}

        {/* Access Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Access Info</h3>
          <p className="text-xs text-muted-foreground">Leave blank to not create a portal login for this student.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Username">
              <Input name="username" value={form.username} onChange={set("username")} placeholder="Leave blank if not needed" minLength={5} maxLength={255} />
            </FormField>
            <FormField label="Password">
              <Input type="password" name="password" value={form.password} onChange={set("password")} placeholder="Leave blank if not needed" minLength={6} maxLength={50} />
            </FormField>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/students">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="ml-auto">
            {loading ? "Saving..." : "+ Add Student"}
          </Button>
        </div>
      </form>
    </div>
  );
}
