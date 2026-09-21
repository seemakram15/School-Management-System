"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IFaq {
  id: number;
  question: string;
  answer: string;
  order: number | null;
  status: number | null;
}

export default function FaqEditForm({ faq }: { faq: IFaq }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    question: faq.question,
    answer: faq.answer,
    order: String(faq.order ?? ""),
    status: String(faq.status ?? 1),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/site/faq/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: parseInt(form.order) || 0, status: parseInt(form.status) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("FAQ updated");
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
        <p className="text-sm text-muted-foreground">Edit FAQ</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Question *">
            <Textarea rows={2} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} required />
          </FormField>
          <FormField label="Answer *">
            <Textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} required />
          </FormField>
          <FormField label="Order">
            <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/faq"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update FAQ"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
