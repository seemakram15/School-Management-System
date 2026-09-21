"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Option = { id: number; name?: string; title?: string };

export default function GenerateForm({ feeTypes, classes, years, defaultYearId }: { feeTypes: Option[]; classes: Option[]; years: Option[]; defaultYearId?: number }) {
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: fd.get("class_id"),
        academic_year_id: fd.get("academic_year_id"),
        fee_type_id: fd.get("fee_type_id"),
        month: fd.get("month"),
        year: fd.get("year"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setResult(data);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400">
          ✓ Generated <strong>{result.created}</strong> invoices. Skipped <strong>{result.skipped}</strong> (already existed).
        </div>
      )}
      {[
        { label: "Fee Type", name: "fee_type_id", opts: feeTypes.map(f => ({ value: f.id, label: f.name! })) },
        { label: "Class", name: "class_id", opts: classes.map(c => ({ value: c.id, label: c.name! })) },
        { label: "Academic Year", name: "academic_year_id", opts: years.map(y => ({ value: y.id, label: y.title! })), defaultValue: defaultYearId },
      ].map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label} <span className="text-destructive">*</span></label>
          <select name={field.name} required defaultValue={String(field.defaultValue ?? "")} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select {field.label}</option>
            {field.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Month <span className="text-destructive">*</span></label>
          <select name="month" required defaultValue={today.getMonth() + 1} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year <span className="text-destructive">*</span></label>
          <input name="year" type="number" required defaultValue={today.getFullYear()} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Students with an existing invoice for this period will be skipped automatically.</p>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Generating…" : "Generate Invoices"}</Button>
    </form>
  );
}
