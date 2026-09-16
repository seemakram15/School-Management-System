"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IClass { id: number; name: string; }
interface Exam { id: number; name: string; }
interface AcYear { id: number; title: string; is_running: boolean; }

export default function ResultGeneratePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<IClass[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [academicYears, setAcademicYears] = useState<AcYear[]>([]);
  const [classId, setClassId] = useState("");
  const [examId, setExamId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/academic/classes").then(r => r.json()),
      fetch("/api/exams").then(r => r.json()),
      fetch("/api/academic/years").then(r => r.json()),
    ]).then(([cls, ex, yr]) => {
      setClasses(cls);
      setExams(ex);
      setAcademicYears(yr);
      const running = yr.find((y: AcYear) => y.is_running);
      if (running) setAcademicYearId(String(running.id));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/results/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: classId, exam_id: examId, academic_year_id: academicYearId, publish_date: publishDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Results generated for ${data.count} students`);
      router.push("/results");
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
          <h2 className="text-xl font-bold text-foreground">Result</h2>
          <p className="text-sm text-muted-foreground">Generate Results</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/results" className="hover:text-foreground">Results</Link>
          <span>/</span>
          <span className="text-foreground">Generate</span>
        </nav>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Academic Year">
              <Select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} required>
                <option value="">Pick a year...</option>
                {academicYears.map(y => <option key={y.id} value={y.id}>{y.title}{y.is_running ? " (Running)" : ""}</option>)}
              </Select>
            </FormField>
            <FormField label="Class *">
              <Select value={classId} onChange={e => setClassId(e.target.value)} required>
                <option value="">Pick a class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Exam *">
              <Select value={examId} onChange={e => setExamId(e.target.value)} required>
                <option value="">Pick an exam...</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Result Publish Date *">
              <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </FormField>
          </div>

          <div className="flex gap-3">
            <Link href="/results"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">
              {loading ? "Generating..." : "Generate Results"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
