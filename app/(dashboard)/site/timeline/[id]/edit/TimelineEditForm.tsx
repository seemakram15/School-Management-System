"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ITimelineItem {
  id: number;
  year: string;
  title: string;
  description: string | null;
  order: number | null;
  status: number | null;
}

export default function TimelineEditForm({ item }: { item: ITimelineItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    year: item.year,
    title: item.title,
    description: item.description ?? "",
    order: String(item.order ?? ""),
    status: String(item.status ?? 1),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/site/timeline/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: parseInt(form.order) || 0, status: parseInt(form.status) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Timeline item updated");
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
        <p className="text-sm text-muted-foreground">Edit Timeline Item</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Year *">
            <Input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required maxLength={20} />
          </FormField>
          <FormField label="Title *">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required maxLength={200} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
          <FormField label="Order">
            <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/timeline"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Item"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
