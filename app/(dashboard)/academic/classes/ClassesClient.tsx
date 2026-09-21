"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Eye } from "lucide-react";

type ClassRow = {
  id: number; name: string; numeric_value: number | null;
  have_selective_subject: boolean | null; max_selective_subject?: number | null;
  have_elective_subject: boolean | null; status: number | null;
};

type FormState = {
  name: string; numeric_value: string; have_selective_subject: boolean;
  max_selective_subject: string; have_elective_subject: boolean;
};

const EMPTY: FormState = { name: "", numeric_value: "", have_selective_subject: false, max_selective_subject: "0", have_elective_subject: false };

export function ClassesClient({ initialRows }: { initialRows: ClassRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);

  function openNew() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(r: ClassRow) {
    setEditing(r);
    setForm({
      name: r.name, numeric_value: String(r.numeric_value ?? ""),
      have_selective_subject: !!r.have_selective_subject,
      max_selective_subject: String((r as any).max_selective_subject ?? 0),
      have_elective_subject: !!r.have_elective_subject,
    });
    setOpen(true);
  }
  function close() { setOpen(false); setEditing(null); }
  const set = (k: keyof FormState) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        name: form.name, numeric_value: parseInt(form.numeric_value) || 0,
        have_selective_subject: form.have_selective_subject,
        max_selective_subject: parseInt(form.max_selective_subject) || 0,
        have_elective_subject: form.have_elective_subject,
        status: editing?.status ?? 1,
      };
      const url = editing ? `/api/academic/classes/${editing.id}` : "/api/academic/classes";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editing ? "Class updated" : "Class created");
      if (editing) {
        setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...body } : r));
      } else {
        setRows(prev => [...prev, { id: data.id, ...body, max_selective_subject: body.max_selective_subject }]);
      }
      close();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Classes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total classes</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5" />Add Class</Button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {rows.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">No classes yet</p>
        ) : rows.map(r => (
          <div key={r.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/60">
              <div>
                {r.numeric_value != null && <p className="text-xs font-mono text-muted-foreground leading-none mb-1">#{r.numeric_value}</p>}
                <p className="font-bold text-foreground text-base">{r.name}</p>
              </div>
              <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Status</p>
                <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Selective</p>
                <div className="text-sm">{r.have_selective_subject ? <Badge variant="info">Yes</Badge> : <span className="text-muted-foreground">No</span>}</div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Elective</p>
                <div className="text-sm">{r.have_elective_subject ? <Badge variant="success">Yes</Badge> : <span className="text-muted-foreground">No</span>}</div>
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
              {["#", "Class Name", "Selective", "Elective", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No classes yet</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{r.numeric_value ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-3">{r.have_selective_subject ? <Badge variant="info">Yes</Badge> : <span className="text-muted-foreground text-xs">No</span>}</td>
                <td className="px-4 py-3">{r.have_elective_subject ? <Badge variant="success">Yes</Badge> : <span className="text-muted-foreground text-xs">No</span>}</td>
                <td className="px-4 py-3"><Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-sm font-medium mb-1">Class Name <span className="text-destructive">*</span></label>
              <input value={form.name} onChange={e => set("name")(e.target.value)} required maxLength={100}
                placeholder="e.g. Class One"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order / Numeric Value</label>
              <input type="number" value={form.numeric_value} onChange={e => set("numeric_value")(e.target.value)}
                placeholder="For ordering (e.g. 1, 2, 3)"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input type="checkbox" className="accent-primary w-4 h-4"
                  checked={form.have_selective_subject}
                  onChange={e => set("have_selective_subject")(e.target.checked)} />
                Has Selective Subjects
              </label>
              {form.have_selective_subject && (
                <div className="ml-6">
                  <label className="block text-sm font-medium mb-1">Max Selective Subjects</label>
                  <input type="number" value={form.max_selective_subject} min={1} max={10}
                    onChange={e => set("max_selective_subject")(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
                </div>
              )}
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input type="checkbox" className="accent-primary w-4 h-4"
                  checked={form.have_elective_subject}
                  onChange={e => set("have_elective_subject")(e.target.checked)} />
                Has Elective (4th) Subject
              </label>
            </div>
            {editing && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={editing.status ?? 1} onChange={e => setEditing(prev => prev ? { ...prev, status: parseInt(e.target.value) } : prev)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : editing ? "Update" : "Add Class"}</Button>
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
