"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TimelineNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ year: "", title: "", description: "", order: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/site/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: parseInt(form.order) || 0, status: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Timeline item created");
      router.push("/site/timeline");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Timeline</h2>
        <p className="text-sm text-muted-foreground">Add New Timeline Item</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Year *">
            <Input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="e.g. 2020" required maxLength={20} />
          </FormField>
          <FormField label="Title *">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. School Founded" required maxLength={200} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
          </FormField>
          <FormField label="Order">
            <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} placeholder="For ordering (e.g. 1, 2, 3)" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/timeline"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Add Item"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
