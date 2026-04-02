"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Exam { id: number; name: string; class_id: number | null; }
interface IClass { id: number; name: string; }
interface Subject { id: number; name: string; }
interface ExamRule { id: number; subject_id: number; total_marks: number; pass_marks: number; }

interface RuleRow { subject_id: number; subject_name: string; rule_id: number | null; total_marks: number; pass_marks: number; }

export default function ExamRulesPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState<RuleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/exams").then(r => r.json()),
      fetch("/api/academic/classes").then(r => r.json()),
    ]).then(([ex, cls]) => {
      setExams(ex);
      setClasses(cls);
    });
  }, []);

  const loadRules = useCallback(async () => {
    if (!examId || !classId) { setRows([]); return; }
    setLoading(true);
    try {
      const [subjects, rules]: [Subject[], ExamRule[]] = await Promise.all([
        fetch(`/api/academic/subjects?class_id=${classId}`).then(r => r.json()),
        fetch(`/api/exams/rules?exam_id=${examId}&class_id=${classId}`).then(r => r.json()),
      ]);
      setRows(subjects.map(s => {
        const rule = rules.find(r => r.subject_id === s.id);
        return {
          subject_id: s.id,
          subject_name: s.name,
          rule_id: rule?.id ?? null,
          total_marks: rule?.total_marks ?? 100,
          pass_marks: rule?.pass_marks ?? 33,
        };
      }));
    } finally {
      setLoading(false);
    }
  }, [examId, classId]);

  useEffect(() => { loadRules(); }, [loadRules]);

  const updateRow = (subjectId: number, field: "total_marks" | "pass_marks", value: string) => {
    setRows(rs => rs.map(r => r.subject_id === subjectId ? { ...r, [field]: parseInt(value) || 0 } : r));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(rows.map(row => {
        const body = {
          exam_id: parseInt(examId),
          class_id: parseInt(classId),
          subject_id: row.subject_id,
          total_marks: row.total_marks,
          pass_marks: row.pass_marks,
        };
        return row.rule_id
          ? fetch(`/api/exams/rules/${row.rule_id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
          : fetch("/api/exams/rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }));
      toast.success("Rules saved");
      loadRules();
    } catch {
      toast.error("Failed to save rules");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Exam Rules</h2>
        <p className="text-sm text-muted-foreground">Set total &amp; pass marks per subject for an exam</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-3xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Exam *">
            <Select value={examId} onChange={e => setExamId(e.target.value)}>
              <option value="">Select exam</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Class *">
            <Select value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading subjects…</p>}

        {!loading && examId && classId && (
          rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subjects found for this class.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pass Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(row => (
                    <tr key={row.subject_id}>
                      <td className="px-4 py-3 text-foreground">{row.subject_name}</td>
                      <td className="px-4 py-3"><Input type="number" min={0} value={row.total_marks} onChange={e => updateRow(row.subject_id, "total_marks", e.target.value)} /></td>
                      <td className="px-4 py-3"><Input type="number" min={0} value={row.pass_marks} onChange={e => updateRow(row.subject_id, "pass_marks", e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {rows.length > 0 && (
          <div className="flex pt-2">
            <Button onClick={handleSave} disabled={saving} className="ml-auto">{saving ? "Saving..." : "Save Rules"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
