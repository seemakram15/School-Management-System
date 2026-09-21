"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FeeType = { id: number; name: string; description: string | null; status: number };

export function FeeTypesClient({ initialTypes }: { initialTypes: FeeType[] }) {
  const [types, setTypes] = useState(initialTypes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openNew() { setEditing(null); setError(""); setOpen(true); }
  function openEdit(t: FeeType) { setEditing(t); setError(""); setOpen(true); }
  function closeModal() { setOpen(false); setEditing(null); setError(""); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      ...(editing ? { status: fd.get("status") } : {}),
    };

    const url = editing ? `/api/fees/types/${editing.id}` : "/api/fees/types";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }

    if (editing) {
      setTypes(prev => prev.map(t => t.id === editing.id ? { ...t, ...body, status: parseInt(body.status as string ?? String(t.status)) } : t));
    } else {
      setTypes(prev => [...prev, { id: data.id, name: body.name, description: body.description, status: 1 }]);
    }
    closeModal();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this fee type?")) return;
    const res = await fetch(`/api/fees/types/${id}`, { method: "DELETE" });
    if (res.ok) setTypes(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Types</h2>
          <p className="text-sm text-muted-foreground">Manage fee categories (Tuition, Transport, etc.)</p>
        </div>
        <Button size="sm" onClick={openNew}>+ Add New</Button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {types.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">No fee types yet.</p>
        ) : types.map(t => (
          <div key={t.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/60">
              <p className="font-bold text-foreground text-base">{t.name}</p>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(t)} className="px-3 py-1.5 rounded-lg hover:bg-muted transition text-primary text-xs font-medium">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 rounded-lg hover:bg-muted transition text-destructive text-xs font-medium">Delete</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
              <div className="col-span-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Description</p>
                <p className="text-sm text-foreground">{t.description || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Status</p>
                <Badge variant={t.status === 1 ? "success" : "default"}>{t.status === 1 ? "Active" : "Inactive"}</Badge>
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
              {["#", "Name", "Description", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {types.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No fee types yet. Add one to get started.</td></tr>
            ) : types.map((t, i) => (
              <tr key={t.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.description || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={t.status === 1 ? "success" : "default"}>{t.status === 1 ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                  <button onClick={() => openEdit(t)} className="text-primary text-xs hover:underline">Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="text-destructive text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={v => { if (!v) closeModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Fee Type" : "New Fee Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
              <input name="name" defaultValue={editing?.name ?? ""} required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                placeholder="e.g. Tuition Fee" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" defaultValue={editing?.description ?? ""} rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
                placeholder="Optional description" />
            </div>
            {editing && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" defaultValue={editing.status}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : editing ? "Update" : "Save"}</Button>
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
