"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Option = { id: number; name?: string; title?: string };

export default function NewStructureForm({ feeTypes, classes, years }: { feeTypes: Option[]; classes: Option[]; years: Option[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fee_type_id: fd.get("fee_type_id"),
        class_id: fd.get("class_id"),
        academic_year_id: fd.get("academic_year_id"),
        amount: fd.get("amount"),
        frequency: fd.get("frequency"),
        due_day: fd.get("due_day"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/fees/structures");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {[
        { label: "Fee Type", name: "fee_type_id", opts: feeTypes.map(f => ({ value: f.id, label: f.name! })) },
        { label: "Class", name: "class_id", opts: classes.map(c => ({ value: c.id, label: c.name! })) },
        { label: "Academic Year", name: "academic_year_id", opts: years.map(y => ({ value: y.id, label: y.title! })) },
      ].map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label} <span className="text-destructive">*</span></label>
          <select name={field.name} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select {field.label}</option>
            {field.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Amount (PKR) *</label>
          <input name="amount" type="number" min="0" step="0.01" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. 2000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Frequency</label>
          <select name="frequency" defaultValue="monthly" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="one_time">One Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Day</label>
          <input name="due_day" type="number" min="1" max="28" defaultValue="10" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Structure"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
