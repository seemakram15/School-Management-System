"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FaqNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", order: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/site/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: parseInt(form.order) || 0, status: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("FAQ created");
      router.push("/site/faq");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">FAQ</h2>
        <p className="text-sm text-muted-foreground">Add New FAQ</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Question *">
            <Textarea rows={2} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="e.g. What are the admission requirements?" required />
          </FormField>
          <FormField label="Answer *">
            <Textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Answer text" required />
          </FormField>
          <FormField label="Order">
            <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} placeholder="For ordering (e.g. 1, 2, 3)" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/faq"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Add FAQ"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
