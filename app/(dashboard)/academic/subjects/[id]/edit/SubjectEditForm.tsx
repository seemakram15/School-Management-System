"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IClass { id: number; name: string; }
interface Subject { id: number; name: string; code: string | null; type: string; class_id: number; status: number | null; }

const SUBJECT_TYPES = { core: "Core / Mandatory", selective: "Selective / Optional", elective: "Elective / 4th Subject" };

export default function SubjectEditForm({ subject }: { subject: Subject }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [form, setForm] = useState({
    name: subject.name,
    code: subject.code ?? "",
    class_id: String(subject.class_id),
    type: subject.type,
  });

  useEffect(() => { fetch("/api/academic/classes").then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : [])); }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/academic/subjects/${subject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, class_id: parseInt(form.class_id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Subject updated");
      router.push("/academic/subjects");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Subject</h2>
        <p className="text-sm text-muted-foreground">Edit Subject</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Class *">
            <Select value={form.class_id} onChange={set("class_id")} required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Subject Name *">
              <Input value={form.name} onChange={set("name")} placeholder="e.g. Mathematics" required maxLength={100} />
            </FormField>
            <FormField label="Subject Code *">
              <Input value={form.code} onChange={set("code")} placeholder="e.g. MATH101" required maxLength={20} />
            </FormField>
          </div>
          <FormField label="Type *">
            <Select value={form.type} onChange={set("type")} required>
              {Object.entries(SUBJECT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/academic/subjects"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Subject"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
