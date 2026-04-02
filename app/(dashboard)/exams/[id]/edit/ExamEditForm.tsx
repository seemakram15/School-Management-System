"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IClass { id: number; name: string; }
interface AcYear { id: number; title: string; is_running: boolean; }
interface Exam {
  id: number;
  name: string;
  status: number;
  class_id: number | null;
  academic_year_id: number;
  start_date: string | null;
  end_date: string | null;
}

export function ExamEditForm({ exam }: { exam: Exam }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcYear[]>([]);
  const [form, setForm] = useState({
    name: exam.name,
    class_id: exam.class_id ? String(exam.class_id) : "",
    academic_year_id: String(exam.academic_year_id),
    start_date: exam.start_date ?? "",
    end_date: exam.end_date ?? "",
    status: String(exam.status),
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/academic/classes").then(r => r.json()),
      fetch("/api/academic/years").then(r => r.json()),
    ]).then(([cls, yrs]) => {
      setClasses(cls);
      setAcademicYears(yrs);
    });
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          class_id: parseInt(form.class_id),
          academic_year_id: parseInt(form.academic_year_id),
          status: parseInt(form.status),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Exam updated");
      router.push("/exams");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Exam Name *">
          <Input value={form.name} onChange={set("name")} placeholder="e.g. Half Yearly Exam 2025" required maxLength={255} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Class *">
            <Select value={form.class_id} onChange={set("class_id")} required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Academic Year *">
            <Select value={form.academic_year_id} onChange={set("academic_year_id")} required>
              <option value="">Select year</option>
              {academicYears.map(y => <option key={y.id} value={y.id}>{y.title}{y.is_running ? " (Running)" : ""}</option>)}
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date *">
            <Input type="date" value={form.start_date} onChange={set("start_date")} required />
          </FormField>
          <FormField label="End Date *">
            <Input type="date" value={form.end_date} onChange={set("end_date")} required />
          </FormField>
        </div>
        <FormField label="Status">
          <Select value={form.status} onChange={set("status")}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </Select>
        </FormField>
        <div className="flex gap-3 pt-2">
          <Link href="/exams"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Exam"}</Button>
        </div>
      </form>
    </div>
  );
}
