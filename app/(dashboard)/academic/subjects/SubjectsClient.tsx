"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";

type SubjectRow = { id: number; name: string; code: string; type: string; status: number; class_id: number; i_classes: { name: string } | null };
type ClassOption = { id: number; name: string };

const TYPE_LABEL: Record<string, string> = { core: "Core", selective: "Selective", elective: "Elective" };
const TYPE_VARIANT: Record<string, "info" | "warning" | "success"> = { core: "info", selective: "warning", elective: "success" };

export function SubjectsClient({ initialRows, classes }: { initialRows: SubjectRow[]; classes: ClassOption[] }) {
  const [rows, setRows] = useState(initialRows);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [form, setForm] = useState({ name: "", code: "", class_id: "", type: "core", status: "1" });
  const [loading, setLoading] = useState(false);

  const EMPTY = { name: "", code: "", class_id: "", type: "core", status: "1" };
  function openNew() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function openEdit(r: SubjectRow) {
    setEditing(r);
    setForm({ name: r.name, code: r.code ?? "", class_id: String(r.class_id), type: r.type, status: String(r.status) });
    setOpen(true);
  }
  function close() { setOpen(false); setEditing(null); }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { name: form.name, code: form.code, class_id: parseInt(form.class_id), type: form.type, status: parseInt(form.status) };
      const url = editing ? `/api/academic/subjects/${editing.id}` : "/api/academic/subjects";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editing ? "Subject updated" : "Subject created");
      const cls = classes.find(c => c.id === body.class_id);
      if (editing) {
        setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...body, i_classes: cls ? { name: cls.name } : r.i_classes } : r));
      } else {
        setRows(prev => [...prev, { id: data.id, ...body, i_classes: cls ? { name: cls.name } : null }]);
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
          <h2 className="text-xl font-bold text-foreground">Subjects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total subjects</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5" />Add Subject</Button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {rows.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">No subjects yet</p>
        ) : rows.map(r => (
          <div key={r.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/60">
              <div>
                <p className="text-xs font-mono text-muted-foreground leading-none mb-1">{r.code}</p>
                <p className="font-bold text-foreground text-base">{r.name}</p>
              </div>
              <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Class</p>
                <p className="text-sm text-foreground">{r.i_classes?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Type</p>
                <Badge variant={TYPE_VARIANT[r.type] ?? "info"}>{TYPE_LABEL[r.type] ?? r.type}</Badge>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Status</p>
                <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>
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
              {["Class", "Subject Name", "Code", "Type", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No subjects yet</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{r.i_classes?.name ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.code}</td>
                <td className="px-4 py-3"><Badge variant={TYPE_VARIANT[r.type] ?? "info"}>{TYPE_LABEL[r.type] ?? r.type}</Badge></td>
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-sm font-medium mb-1">Class <span className="text-destructive">*</span></label>
              <select value={form.class_id} onChange={set("class_id")} required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Name <span className="text-destructive">*</span></label>
                <input value={form.name} onChange={set("name")} required maxLength={100}
                  placeholder="e.g. Mathematics"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code <span className="text-destructive">*</span></label>
                <input value={form.code} onChange={set("code")} required maxLength={20}
                  placeholder="e.g. MATH101"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type <span className="text-destructive">*</span></label>
              <select value={form.type} onChange={set("type")} required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                <option value="core">Core / Mandatory</option>
                <option value="selective">Selective / Optional</option>
                <option value="elective">Elective / 4th Subject</option>
              </select>
            </div>
            {editing && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status} onChange={set("status")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : editing ? "Update" : "Add Subject"}</Button>
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
