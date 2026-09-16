"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IClass { id: number; name: string; }
interface Section { id: number; name: string; }
interface Subject { id: number; name: string; }
interface Exam { id: number; name: string; }
interface ExamRule { marks_distribution: string; }
interface Distribution { type: string; total_marks: number; }
interface Student { id: number; regi_no: string; roll_no: number; students: { name: string }; }

const MARKS_TYPES: Record<string, string> = {
  "1": "Written", "2": "MCQ", "3": "Practical", "4": "Oral", "5": "Assignment",
  "6": "Class Test", "7": "Lab", "8": "Project",
};

export default function MarksNewPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<IClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [examRule, setExamRule] = useState<ExamRule | null>(null);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState("");
  const [marksData, setMarksData] = useState<Record<number, Record<string, string>>>({});
  const [absentData, setAbsentData] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState<"filter" | "entry">("filter");

  useEffect(() => {
    fetch("/api/academic/classes").then(r => r.json()).then(setClasses);
    fetch("/api/exams").then(r => r.json()).then(setExams);
  }, []);

  useEffect(() => {
    if (classId) {
      fetch(`/api/academic/sections?class_id=${classId}`).then(r => r.json()).then(setSections);
      fetch(`/api/academic/subjects?class_id=${classId}`).then(r => r.json()).then(setSubjects);
    }
  }, [classId]);

  const fetchStudents = async () => {
    if (!classId || !sectionId || !subjectId || !examId) {
      toast.error("Please select all filters");
      return;
    }
    setLoading(true);
    try {
      const [studRes, ruleRes] = await Promise.all([
        fetch(`/api/students?class_id=${classId}&section_id=${sectionId}&status=1`).then(r => r.json()),
        fetch(`/api/exams/rules?exam_id=${examId}&subject_id=${subjectId}`).then(r => r.json()),
      ]);

      setStudents(studRes);

      const rule = Array.isArray(ruleRes) ? ruleRes[0] : ruleRes;
      setExamRule(rule);
      if (rule?.marks_distribution) {
        setDistributions(JSON.parse(rule.marks_distribution));
      } else {
        setDistributions([{ type: "1", total_marks: 100 }]);
      }

      // Load existing marks
      const existingRes = await fetch(`/api/marks?exam_id=${examId}&class_id=${classId}&section_id=${sectionId}&subject_id=${subjectId}`);
      const existing: Array<{ registration_id: number; marks_data: string; is_absent: number }> = await existingRes.json();
      const mData: Record<number, Record<string, string>> = {};
      const aData: Record<number, boolean> = {};
      existing.forEach(m => {
        try { mData[m.registration_id] = JSON.parse(m.marks_data); } catch { mData[m.registration_id] = {}; }
        aData[m.registration_id] = m.is_absent === 1;
      });
      setMarksData(mData);
      setAbsentData(aData);
      setStep("entry");
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId, section_id: sectionId, subject_id: subjectId, exam_id: examId,
          registrationIds: students.map(s => s.id),
          type: marksData,
          absent: absentData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Marks saved successfully");
      router.push("/marks");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving marks");
    } finally {
      setSubmitting(false);
    }
  };

  const totalForStudent = (regId: number) =>
    distributions.reduce((s, d) => s + (Number(marksData[regId]?.[d.type]) || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Marks</h2>
          <p className="text-sm text-muted-foreground">Add Marks</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/marks" className="hover:text-foreground">Marks</Link>
          <span>/</span>
          <span className="text-foreground">Add</span>
        </nav>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        {/* Filters */}
        <fieldset className="border border-border rounded-lg p-4 space-y-3">
          <legend className="text-sm font-semibold px-2 text-muted-foreground">Filters</legend>
          <div className="flex flex-wrap gap-4 items-end">
            <FormField label="Class *" className="w-44">
              <Select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(""); setSubjectId(""); setStep("filter"); setStudents([]); }} required>
                <option value="">Pick a class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Section *" className="w-36">
              <Select value={sectionId} onChange={e => setSectionId(e.target.value)} required disabled={!classId}>
                <option value="">Pick a section...</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Subject *" className="w-44">
              <Select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!classId}>
                <option value="">Pick a subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Exam *" className="w-44">
              <Select value={examId} onChange={e => setExamId(e.target.value)} required>
                <option value="">Pick an exam...</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </FormField>
            <Button type="button" onClick={fetchStudents} disabled={loading}>
              {loading ? "Loading..." : "Entry Marks"}
            </Button>
          </div>
        </fieldset>

        {/* Marks entry table */}
        {step === "entry" && students.length > 0 && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 border-b border-border w-10">#</th>
                    <th className="text-left p-3 border-b border-border">Student Name</th>
                    <th className="p-3 border-b border-border w-20">Roll No.</th>
                    {distributions.map(d => (
                      <th key={d.type} className="p-3 border-b border-border w-28">
                        {MARKS_TYPES[d.type] || `Type ${d.type}`}
                        <div className="text-xs font-normal text-muted-foreground">(max {d.total_marks})</div>
                      </th>
                    ))}
                    <th className="p-3 border-b border-border w-24">Total</th>
                    <th className="p-3 border-b border-border w-20">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} className={`hover:bg-muted/20 transition-colors ${absentData[s.id] ? "opacity-50" : ""}`}>
                      <td className="p-3 border-b border-border text-muted-foreground">{i + 1}</td>
                      <td className="p-3 border-b border-border font-medium">
                        {s.students?.name} <span className="text-muted-foreground font-normal">[{s.regi_no}]</span>
                      </td>
                      <td className="p-3 border-b border-border text-center text-muted-foreground">{s.roll_no}</td>
                      {distributions.map(d => (
                        <td key={d.type} className="p-3 border-b border-border">
                          <input
                            type="number"
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm disabled:opacity-40"
                            value={marksData[s.id]?.[d.type] ?? ""}
                            onChange={e => setMarksData(m => ({
                              ...m,
                              [s.id]: { ...(m[s.id] || {}), [d.type]: e.target.value },
                            }))}
                            min={0}
                            max={d.total_marks}
                            disabled={absentData[s.id]}
                          />
                        </td>
                      ))}
                      <td className="p-3 border-b border-border text-center font-semibold text-primary">
                        {absentData[s.id] ? "—" : totalForStudent(s.id)}
                      </td>
                      <td className="p-3 border-b border-border text-center">
                        <input
                          type="checkbox"
                          className="accent-red-500 w-4 h-4"
                          checked={absentData[s.id] ?? false}
                          onChange={e => setAbsentData(a => ({ ...a, [s.id]: e.target.checked }))}
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
                {submitting ? "Saving..." : "Save Marks"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
