"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AcYear { id: number; title: string; is_running: boolean; }
interface Grade {
  id: number;
  academic_year_id: number;
  name: string;
  percent_from: number;
  percent_to: number;
  grade_point: number;
  pass_mark: number | null;
}

export function GradeEditForm({ grade }: { grade: Grade }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcYear[]>([]);
  const [form, setForm] = useState({
    academic_year_id: String(grade.academic_year_id),
    name: grade.name,
    percent_from: String(grade.percent_from),
    percent_to: String(grade.percent_to),
    grade_point: String(grade.grade_point),
    pass_mark: grade.pass_mark != null ? String(grade.pass_mark) : "",
  });

  useEffect(() => {
    fetch("/api/academic/years").then(r => r.json()).then(setAcademicYears);
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/grades/${grade.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academic_year_id: parseInt(form.academic_year_id),
          name: form.name,
          percent_from: parseFloat(form.percent_from),
          percent_to: parseFloat(form.percent_to),
          grade_point: parseFloat(form.grade_point),
          pass_mark: form.pass_mark ? parseFloat(form.pass_mark) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Grade updated");
      router.push("/exams/grades");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Academic Year *">
            <Select value={form.academic_year_id} onChange={set("academic_year_id")} required>
              <option value="">Select year</option>
              {academicYears.map(y => <option key={y.id} value={y.id}>{y.title}{y.is_running ? " (Running)" : ""}</option>)}
            </Select>
          </FormField>
          <FormField label="Grade Name *">
            <Input value={form.name} onChange={set("name")} placeholder="e.g. A+" required maxLength={20} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Percent From *">
            <Input type="number" step="0.01" min={0} max={100} value={form.percent_from} onChange={set("percent_from")} required />
          </FormField>
          <FormField label="Percent To *">
            <Input type="number" step="0.01" min={0} max={100} value={form.percent_to} onChange={set("percent_to")} required />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Grade Point *">
            <Input type="number" step="0.01" min={0} value={form.grade_point} onChange={set("grade_point")} required />
          </FormField>
          <FormField label="Pass Mark">
            <Input type="number" step="0.01" min={0} value={form.pass_mark} onChange={set("pass_mark")} />
          </FormField>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/exams/grades"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Grade"}</Button>
        </div>
      </form>
    </div>
  );
}
