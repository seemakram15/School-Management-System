"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Option = { id: number; name?: string; title?: string };
type Structure = {
  id: number; amount: number; frequency: string; due_day: number;
  fee_types: { name: string } | null;
  i_classes: { name: string } | null;
  academic_years: { title: string } | null;
};

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "one_time", label: "One Time" },
];

export function FeeStructuresClient({ initialStructures, feeTypes, classes, years }: {
  initialStructures: Structure[];
  feeTypes: Option[];
  classes: Option[];
  years: Option[];
}) {
  const [structures, setStructures] = useState(initialStructures);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Structure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openNew() { setEditing(null); setError(""); setOpen(true); }
  function openEdit(s: Structure) { setEditing(s); setError(""); setOpen(true); }
  function closeModal() { setOpen(false); setEditing(null); setError(""); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);

    if (editing) {
      const body = { amount: fd.get("amount"), frequency: fd.get("frequency"), due_day: fd.get("due_day") };
      const res = await fetch(`/api/fees/structures/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error); return; }
      setStructures(prev => prev.map(s => s.id === editing.id ? {
        ...s, amount: parseFloat(body.amount as string), frequency: body.frequency as string, due_day: parseInt(body.due_day as string),
      } : s));
    } else {
      const body = {
        fee_type_id: fd.get("fee_type_id"), class_id: fd.get("class_id"),
        academic_year_id: fd.get("academic_year_id"), amount: fd.get("amount"),
        frequency: fd.get("frequency"), due_day: fd.get("due_day"),
      };
      const res = await fetch("/api/fees/structures", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error); return; }
      const ft = feeTypes.find(f => f.id === parseInt(body.fee_type_id as string));
      const cl = classes.find(c => c.id === parseInt(body.class_id as string));
      const yr = years.find(y => y.id === parseInt(body.academic_year_id as string));
      setStructures(prev => [...prev, {
        id: data.id, amount: parseFloat(body.amount as string),
        frequency: body.frequency as string, due_day: parseInt(body.due_day as string),
        fee_types: ft ? { name: ft.name! } : null,
        i_classes: cl ? { name: cl.name! } : null,
        academic_years: yr ? { title: yr.title! } : null,
      }]);
    }
    closeModal();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this fee structure?")) return;
    const res = await fetch(`/api/fees/structures/${id}`, { method: "DELETE" });
    if (res.ok) setStructures(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Structures</h2>
          <p className="text-sm text-muted-foreground">Define fee amounts per class and academic year</p>
        </div>
        <Button size="sm" onClick={openNew}>+ Add New</Button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {structures.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">No structures defined yet</p>
        ) : structures.map(s => (
          <div key={s.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/60">
              <div>
                <p className="font-bold text-foreground text-base">{s.fee_types?.name}</p>
                <p className="text-lg font-mono font-semibold text-primary mt-0.5">PKR {Number(s.amount).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(s)} className="px-3 py-1.5 rounded-lg hover:bg-muted transition text-primary text-xs font-medium">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 rounded-lg hover:bg-muted transition text-destructive text-xs font-medium">Del</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Class</p>
                <p className="text-sm text-foreground">{s.i_classes?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Academic Year</p>
                <p className="text-sm text-foreground">{s.academic_years?.title ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Frequency</p>
                <p className="text-sm text-foreground capitalize">{s.frequency?.replace("_", " ") ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Due Day</p>
                <p className="text-sm text-foreground">{s.due_day}th</p>
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
              {["Fee Type", "Class", "Academic Year", "Amount (PKR)", "Frequency", "Due Day", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {structures.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No structures defined yet</td></tr>
            ) : structures.map(s => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.fee_types?.name}</td>
                <td className="px-4 py-3">{s.i_classes?.name}</td>
                <td className="px-4 py-3">{s.academic_years?.title}</td>
                <td className="px-4 py-3 font-mono">PKR {Number(s.amount).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{s.frequency?.replace("_", " ")}</td>
                <td className="px-4 py-3">{s.due_day}th</td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                  <button onClick={() => openEdit(s)} className="text-primary text-xs hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-destructive text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={v => { if (!v) closeModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Fee Structure" : "New Fee Structure"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && <p className="text-sm text-destructive">{error}</p>}

            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border border-border rounded-lg p-3 bg-muted/30">
                <div><span className="text-xs text-muted-foreground">Fee Type</span><p className="font-medium">{editing.fee_types?.name}</p></div>
                <div><span className="text-xs text-muted-foreground">Class</span><p className="font-medium">{editing.i_classes?.name}</p></div>
                <div><span className="text-xs text-muted-foreground">Year</span><p className="font-medium">{editing.academic_years?.title}</p></div>
              </div>
            ) : (
              <>
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
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Amount (PKR) *</label>
                <input name="amount" type="number" min="0" step="0.01" required
                  defaultValue={editing?.amount ?? ""}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                  placeholder="e.g. 2000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select name="frequency" defaultValue={editing?.frequency ?? "monthly"}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Day</label>
                <input name="due_day" type="number" min="1" max="28" defaultValue={editing?.due_day ?? 10}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : editing ? "Update" : "Save Structure"}</Button>
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
