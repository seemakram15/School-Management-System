"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NewFeeTypePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), description: fd.get("description") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/fees/types");
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">New Fee Type</h2>
        <p className="text-sm text-muted-foreground">Create a new fee category</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Name <span className="text-destructive">*</span></label>
          <input name="name" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. Tuition Fee" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none" placeholder="Optional description" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
