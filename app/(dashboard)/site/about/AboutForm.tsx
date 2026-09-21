"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface AboutImage {
  id: number;
  image: string;
  caption: string | null;
  order: number;
}

export default function AboutForm({
  about,
  images,
}: {
  about: { id: number; title: string; description: string | null };
  images: AboutImage[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: about.title ?? "", description: about.description ?? "" });

  const [imgLoading, setImgLoading] = useState(false);
  const [imgForm, setImgForm] = useState({ image: "", caption: "", order: "0" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/site/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("About content updated");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImgLoading(true);
    try {
      const res = await fetch("/api/site/about/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...imgForm, order: parseInt(imgForm.order) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Image added");
      setImgForm({ image: "", caption: "", order: "0" });
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setImgLoading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    try {
      const res = await fetch(`/api/site/about/images/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Image removed");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">About Content</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage the public "About Us" page content</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="About Us" maxLength={200} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={6} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell visitors about your institute" />
          </FormField>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </form>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Gallery Images</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Images shown alongside the About page</p>
        </div>

        <div className="space-y-2">
          {images.length === 0 && <p className="text-sm text-muted-foreground">No images yet.</p>}
          {images.map(img => (
            <div key={img.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
              <span className="text-xs text-muted-foreground w-6 text-center">{img.order}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{img.image}</p>
                {img.caption && <p className="text-xs text-muted-foreground truncate">{img.caption}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddImage} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px_auto] gap-3 items-end pt-2 border-t border-border">
          <FormField label="Image URL">
            <Input value={imgForm.image} onChange={e => setImgForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." required />
          </FormField>
          <FormField label="Caption">
            <Input value={imgForm.caption} onChange={e => setImgForm(f => ({ ...f, caption: e.target.value }))} placeholder="Optional caption" />
          </FormField>
          <FormField label="Order">
            <Input type="number" value={imgForm.order} onChange={e => setImgForm(f => ({ ...f, order: e.target.value }))} />
          </FormField>
          <Button type="submit" disabled={imgLoading} size="md">
            <Plus className="w-3.5 h-3.5" />
            {imgLoading ? "Adding..." : "Add Image"}
          </Button>
        </form>
      </div>
    </div>
  );
}
