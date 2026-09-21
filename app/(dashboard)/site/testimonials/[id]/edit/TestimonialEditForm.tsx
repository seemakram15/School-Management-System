"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ITestimonial {
  id: number;
  name: string;
  designation: string | null;
  message: string;
  photo: string | null;
  status: number | null;
}

export default function TestimonialEditForm({ testimonial }: { testimonial: ITestimonial }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: testimonial.name,
    designation: testimonial.designation ?? "",
    message: testimonial.message,
    photo: testimonial.photo ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/site/testimonials/${testimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Testimonial updated");
      router.push("/site/testimonials");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Testimonial</h2>
        <p className="text-sm text-muted-foreground">Edit Testimonial</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name *">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" required maxLength={100} />
          </FormField>
          <FormField label="Designation">
            <Input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="e.g. Parent" />
          </FormField>
          <FormField label="Message *">
            <Textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Testimonial message" required />
          </FormField>
          <FormField label="Photo">
            <Input value={form.photo} onChange={e => setForm(f => ({ ...f, photo: e.target.value }))} placeholder="https://... or /images/..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/testimonials"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Testimonial"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
