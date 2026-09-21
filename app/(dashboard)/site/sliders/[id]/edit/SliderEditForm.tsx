"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ISlider {
  id: number;
  title: string;
  sub_title: string | null;
  image: string | null;
  status: number | null;
}

export default function SliderEditForm({ slider }: { slider: ISlider }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: slider.title,
    sub_title: slider.sub_title ?? "",
    image: slider.image ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/site/sliders/${slider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Slider updated");
      router.push("/site/sliders");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Slider</h2>
        <p className="text-sm text-muted-foreground">Edit Slider</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title *">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Welcome to Our School" required maxLength={200} />
          </FormField>
          <FormField label="Sub Title">
            <Textarea rows={2} value={form.sub_title} onChange={e => setForm(f => ({ ...f, sub_title: e.target.value }))} placeholder="Optional sub title" />
          </FormField>
          <FormField label="Image">
            <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://... or /images/..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/site/sliders"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update Slider"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
