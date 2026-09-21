"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Invoice = {
  id: number; invoice_no: string; month: number; year: number;
  net_amount: number; due_date: string; status: string;
  fee_types: { name: string } | null;
  registrations: { students: { name: string } | null; i_classes: { name: string } | null } | null;
};
type Option = { id: number; name?: string; title?: string };

export function InvoicesClient({ invoices, feeTypes, classes, years, filters, statusVariants, months, currentYear }: {
  invoices: Invoice[];
  feeTypes: Option[];
  classes: Option[];
  years: Option[];
  filters: { status?: string; month?: string; year?: string };
  statusVariants: Record<string, "default" | "danger" | "warning" | "success" | "info">;
  months: string[];
  currentYear: number;
}) {
  const router = useRouter();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const today = new Date();

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
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
    if (data.created > 0) router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Invoices</h2>
          <p className="text-sm text-muted-foreground">All student fee invoices</p>
        </div>
        <Button size="sm" onClick={() => { setResult(null); setError(""); setGenerateOpen(true); }}>
          Generate Invoices
        </Button>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Status</label>
            <select name="status" defaultValue={filters.status ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Statuses</option>
              {["unpaid","partial","paid","waived"].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Month</label>
            <select name="month" defaultValue={filters.month ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Months</option>
              {months.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Year</label>
            <select name="year" defaultValue={filters.year ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Years</option>
              {[currentYear, currentYear - 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline">Filter</Button>
          <Link href="/fees/invoices"><Button size="sm" variant="ghost">Clear</Button></Link>
        </div>
      </form>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {invoices.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">No invoices found</p>
        ) : invoices.map(inv => (
          <div key={inv.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/60">
              <div>
                <p className="text-xs font-mono text-muted-foreground leading-none mb-1">{inv.invoice_no}</p>
                <p className="font-bold text-foreground text-base">{inv.registrations?.students?.name}</p>
                <p className="text-lg font-mono font-semibold text-primary mt-0.5">PKR {Number(inv.net_amount).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge variant={statusVariants[inv.status] ?? "default"} className="capitalize">{inv.status}</Badge>
                <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs font-medium hover:underline">View →</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Class</p>
                <p className="text-sm text-foreground">{inv.registrations?.i_classes?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Fee Type</p>
                <p className="text-sm text-foreground">{inv.fee_types?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Period</p>
                <p className="text-sm text-foreground">{inv.month ? `${months[inv.month]} ${inv.year}` : String(inv.year)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Due Date</p>
                <p className="text-sm text-foreground">{inv.due_date ?? "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-card rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Invoice #","Student","Class","Fee Type","Period","Amount","Due Date","Status",""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No invoices found</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.invoice_no}</td>
                <td className="px-4 py-3 font-medium">{inv.registrations?.students?.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.registrations?.i_classes?.name}</td>
                <td className="px-4 py-3">{inv.fee_types?.name}</td>
                <td className="px-4 py-3">{inv.month ? `${months[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                <td className="px-4 py-3 font-mono">PKR {Number(inv.net_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.due_date}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[inv.status] ?? "default"} className="capitalize">{inv.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Modal */}
      <Dialog open={generateOpen} onOpenChange={v => { if (!v) { setGenerateOpen(false); setResult(null); setError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Fee Invoices</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="space-y-4 pt-1">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {result && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">
                ✓ Generated <strong>{result.created}</strong> invoices. Skipped <strong>{result.skipped}</strong> (already existed).
              </div>
            )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Month <span className="text-destructive">*</span></label>
                <select name="month" required defaultValue={today.getMonth() + 1} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                  {months.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year <span className="text-destructive">*</span></label>
                <input name="year" type="number" required defaultValue={today.getFullYear()}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Students with an existing invoice for this period will be skipped automatically.</p>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">{loading ? "Generating…" : "Generate Invoices"}</Button>
              <Button type="button" variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
