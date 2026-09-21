"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EventNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", start_date: "", end_date: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/site/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Event created");
      router.push("/site/events");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Event</h2>
        <p className="text-sm text-muted-foreground">Add New Event</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title *">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Sports Day" required maxLength={200} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Event details" />
          </FormField>
          <FormField label="Start Date *">
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
          </FormField>
          <FormField label="End Date *">
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/events"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Add Event"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
