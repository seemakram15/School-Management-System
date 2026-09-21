"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IClass { id: number; name: string; }
interface Section { id: number; name: string; class_id: number; capacity: number | null; status: number | null; }

export default function SectionEditForm({ section }: { section: Section }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [form, setForm] = useState({
    name: section.name,
    class_id: String(section.class_id),
    capacity: String(section.capacity ?? ""),
  });

  useEffect(() => { fetch("/api/academic/classes").then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : [])); }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/academic/sections/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, class_id: parseInt(form.class_id), capacity: parseInt(form.capacity) || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Section updated");
      router.push("/academic/sections");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Section</h2>
        <p className="text-sm text-muted-foreground">Edit Section</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Class *">
            <Select value={form.class_id} onChange={set("class_id")} required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Section Name *">
            <Input value={form.name} onChange={set("name")} placeholder="e.g. A, B, Red" required maxLength={100} />
          </FormField>
          <FormField label="Capacity">
            <Input type="number" value={form.capacity} onChange={set("capacity")} placeholder="Max students (optional)" min={1} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/academic/sections"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Section"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
