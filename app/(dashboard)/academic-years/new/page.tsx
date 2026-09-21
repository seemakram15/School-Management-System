"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/lib/utils";

export default function AcademicYearNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", year: "", start_date: "", end_date: "", is_running: false, status: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/academic/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: parseInt(form.status) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Academic year created");
      router.push("/academic-years");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Academic Year</h2>
        <p className="text-sm text-muted-foreground">Add New Academic Year</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title *">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Academic Year 2025-2026" required maxLength={255} />
          </FormField>
          <FormField label="Year *">
            <Input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="e.g. 2025-2026" required maxLength={10} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Start Date">
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </FormField>
            <FormField label="End Date">
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-primary" checked={form.is_running} onChange={e => setForm(f => ({ ...f, is_running: e.target.checked }))} />
            Is Running (current academic year)
          </label>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/academic-years"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Add Academic Year"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
