"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IClassOption { id: number; name: string }

interface IClassProfile {
  id: number;
  class_id: number | null;
  description: string | null;
  image: string | null;
  status: number | null;
}

export default function ClassProfileEditForm({ profile }: { profile: IClassProfile }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<IClassOption[]>([]);
  const [form, setForm] = useState({
    class_id: String(profile.class_id ?? ""),
    description: profile.description ?? "",
    image: profile.image ?? "",
  });

  useEffect(() => {
    fetch("/api/academic/classes").then(res => res.json()).then(setClasses).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/site/classes/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, class_id: parseInt(form.class_id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Class profile updated");
      router.push("/site/classes");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Class Profile</h2>
        <p className="text-sm text-muted-foreground">Edit Class Profile</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Class *">
            <Select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))} required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Description">
            <Textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Class description" />
          </FormField>
          <FormField label="Image">
            <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://... or /images/..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/classes"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Class Profile"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
