"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function FeeTypeEditForm({ type }: { type: { id: number; name: string; description: string | null; status: number } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/fees/types/${type.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), description: fd.get("description"), status: fd.get("status") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/fees/types");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
        <input name="name" defaultValue={type.name} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" defaultValue={type.description ?? ""} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select name="status" defaultValue={type.status} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Update"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
