"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StructureEditForm({ structure }: { structure: { id: number; amount: number; frequency: string; due_day: number; fee_types: any; i_classes: any; academic_years: any } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/fees/structures/${structure.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: fd.get("amount"), frequency: fd.get("frequency"), due_day: fd.get("due_day") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/fees/structures");
  }

  async function handleDelete() {
    if (!confirm("Delete this fee structure?")) return;
    const res = await fetch(`/api/fees/structures/${structure.id}`, { method: "DELETE" });
    if (res.ok) router.push("/fees/structures");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground pb-2 border-b border-border">
        <div><span className="block text-xs mb-1">Fee Type</span><strong className="text-foreground">{structure.fee_types?.name}</strong></div>
        <div><span className="block text-xs mb-1">Class</span><strong className="text-foreground">{structure.i_classes?.name}</strong></div>
        <div><span className="block text-xs mb-1">Academic Year</span><strong className="text-foreground">{structure.academic_years?.title}</strong></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Amount (PKR) *</label>
          <input name="amount" type="number" min="0" step="0.01" defaultValue={structure.amount} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Frequency</label>
          <select name="frequency" defaultValue={structure.frequency} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="one_time">One Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Day</label>
          <input name="due_day" type="number" min="1" max="28" defaultValue={structure.due_day} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Update"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="button" variant="danger" onClick={handleDelete} className="ml-auto">Delete</Button>
      </div>
    </form>
  );
}
