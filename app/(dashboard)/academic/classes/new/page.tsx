"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ClassNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", numeric_value: "", have_selective_subject: false,
    max_selective_subject: "0", have_elective_subject: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/academic/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, numeric_value: parseInt(form.numeric_value) || 0, max_selective_subject: parseInt(form.max_selective_subject) || 0, status: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Class created");
      router.push("/academic/classes");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Class</h2>
        <p className="text-sm text-muted-foreground">Add New Class</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Class Name *">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Class One" required maxLength={100} />
          </FormField>
          <FormField label="Numeric Value">
            <Input type="number" value={form.numeric_value} onChange={e => setForm(f => ({ ...f, numeric_value: e.target.value }))} placeholder="For ordering (e.g. 1, 2, 3)" />
          </FormField>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="accent-primary" checked={form.have_selective_subject} onChange={e => setForm(f => ({ ...f, have_selective_subject: e.target.checked }))} />
              Has Selective Subjects
            </label>
            {form.have_selective_subject && (
              <FormField label="Max Selective Subjects">
                <Input type="number" value={form.max_selective_subject} onChange={e => setForm(f => ({ ...f, max_selective_subject: e.target.value }))} min={1} max={10} />
              </FormField>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="accent-primary" checked={form.have_elective_subject} onChange={e => setForm(f => ({ ...f, have_elective_subject: e.target.checked }))} />
              Has Elective (4th) Subject
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/academic/classes"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Add Class"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
