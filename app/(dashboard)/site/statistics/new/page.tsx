"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StatisticNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ label: "", value: "", icon: "", order: "0", status: "1" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/site/statistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: parseInt(form.order) || 0, status: parseInt(form.status) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Statistic created");
      router.push("/site/statistics");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Statistic</h2>
        <p className="text-sm text-muted-foreground">Add New Statistic</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Label *">
              <Input value={form.label} onChange={set("label")} placeholder="e.g. Students Enrolled" required maxLength={100} />
            </FormField>
            <FormField label="Value *">
              <Input value={form.value} onChange={set("value")} placeholder="e.g. 1200+" required maxLength={50} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Icon">
              <Input value={form.icon} onChange={set("icon")} placeholder="e.g. users or 🎓" />
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
            <Link href="/site/statistics"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Add Statistic"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
