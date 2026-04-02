"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IClass { id: number; name: string; }
interface Section { id: number; name: string; }
interface Student { id: number; regi_no: string; roll_no: number; info: { name: string }; }

export default function StudentAttendanceNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [classes, setClasses] = useState<IClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [classId, setClassId] = useState(searchParams.get("class_id") || "");
  const [sectionId, setSectionId] = useState(searchParams.get("section_id") || "");
  const [date, setDate] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);
  const [present, setPresent] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState<"filter" | "entry">(
    searchParams.get("class_id") && searchParams.get("section_id") ? "entry" : "filter"
  );
  const [meta, setMeta] = useState<{ className: string; sectionName: string }>({ className: "", sectionName: "" });

  useEffect(() => {
    fetch("/api/academic/classes").then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (classId) {
      fetch(`/api/academic/sections?class_id=${classId}`).then(r => r.json()).then(d => setSections(Array.isArray(d) ? d : []));
    }
  }, [classId]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?class_id=${classId}&section_id=${sectionId}&status=1`);
      const data: Array<{ id: number; regi_no: string; roll_no: number; students: { name: string } }> = await res.json();
      const mapped = data.map(s => ({ id: s.id, regi_no: s.regi_no, roll_no: s.roll_no, info: { name: s.students?.name ?? "" } }));

      const cls = classes.find(c => c.id === parseInt(classId));
      const sec = sections.find(s => s.id === parseInt(sectionId));
      setMeta({ className: cls?.name ?? "", sectionName: sec?.name ?? "" });

      // Check existing attendance
      const existing = await fetch(`/api/attendance/students?class_id=${classId}&section_id=${sectionId}&date=${date}`).then(r => r.json()) as Array<{ registration_id: number; status: number }>;
      const existingMap: Record<number, boolean> = {};
      existing.forEach(a => { existingMap[a.registration_id] = a.status === 1; });

      setStudents(mapped);
      setPresent(existingMap);
      setStep("entry");
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = (val: boolean) => {
    const all: Record<number, boolean> = {};
    students.forEach(s => { all[s.id] = val; });
    setPresent(all);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          section_id: sectionId,
          attendance_date: date,
          registrationIds: students.map(s => s.id),
          present,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Attendance saved for ${data.count} students`);
      router.push("/attendance/students");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Student Attendance</h2>
          <p className="text-sm text-muted-foreground">Add New Attendance</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/attendance/students" className="hover:text-foreground">Student Attendance</Link>
          <span>/</span>
          <span className="text-foreground">Add</span>
        </nav>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        {step === "filter" && (
          <>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Academic Info</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <FormField label="Class *" className="w-48">
                <Select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(""); }} required>
                  <option value="">Pick a class...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Section *" className="w-40">
                <Select value={sectionId} onChange={e => setSectionId(e.target.value)} required disabled={!classId}>
                  <option value="">Pick a section...</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Date *" className="w-44">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required />
              </FormField>
              <Button type="button" onClick={fetchStudents} disabled={!classId || !sectionId || loading}>
                {loading ? "Loading..." : "Entry Attendance"}
              </Button>
            </div>
          </>
        )}

        {step === "entry" && students.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center space-y-0.5">
              <p className="text-blue-800 dark:text-blue-200 font-semibold">Attendance Entry for {date}</p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">Class: {meta.className} &bull; Section: {meta.sectionName}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 border-b border-border w-12">#</th>
                    <th className="text-left p-3 border-b border-border">Name</th>
                    <th className="text-left p-3 border-b border-border w-24">Roll No.</th>
                    <th className="p-3 border-b border-border w-40">
                      <div className="flex items-center gap-2">
                        Is Present?
                        <label className="flex items-center gap-1 text-xs font-normal cursor-pointer">
                          <input type="checkbox" className="accent-primary" onChange={e => toggleAll(e.target.checked)} />
                          All
                        </label>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 border-b border-border text-muted-foreground">{i + 1}</td>
                      <td className="p-3 border-b border-border font-medium">{s.info.name} <span className="text-muted-foreground font-normal">[{s.regi_no}]</span></td>
                      <td className="p-3 border-b border-border text-muted-foreground">{s.roll_no}</td>
                      <td className="p-3 border-b border-border">
                        <input
                          type="checkbox"
                          className="accent-primary w-4 h-4"
                          checked={present[s.id] ?? false}
                          onChange={e => setPresent(p => ({ ...p, [s.id]: e.target.checked }))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setStep("filter"); setStudents([]); }}>Back</Button>
              <Button type="button" onClick={handleSubmit} disabled={submitting} className="ml-auto">
                {submitting ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
