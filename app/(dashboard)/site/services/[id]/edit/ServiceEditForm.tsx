"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IService {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  order: number | null;
  status: number | null;
}

export default function ServiceEditForm({ service }: { service: IService }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: service.title,
    description: service.description ?? "",
    icon: service.icon ?? "",
    order: String(service.order ?? 0),
    status: String(service.status ?? 1),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/site/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: parseInt(form.order) || 0, status: parseInt(form.status) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Service updated");
      router.push("/site/services");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Service</h2>
        <p className="text-sm text-muted-foreground">Edit Service</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title *">
            <Input value={form.title} onChange={set("title")} placeholder="e.g. Online Admission" required maxLength={200} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={3} value={form.description} onChange={set("description")} placeholder="Short description of the service" />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Icon">
              <Input value={form.icon} onChange={set("icon")} placeholder="e.g. graduation-cap or 🎓" />
            </FormField>
            <FormField label="Order">
              <Input type="number" value={form.order} onChange={set("order")} placeholder="0" />
            </FormField>
          </div>
          <FormField label="Status">
            <Select value={form.status} onChange={set("status")}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/services"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Service"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
