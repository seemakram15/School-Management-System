"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface GalleryImage {
  id: number;
  image: string;
  caption: string | null;
  order: number | null;
  status: number | null;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ image: "", caption: "", order: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site/gallery");
      const data = await res.json();
      setImages(data);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) return;
    setSaving(true);
    try {
      const res = await fetch("/api/site/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: parseInt(form.order) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Image added");
      setForm({ image: "", caption: "", order: "" });
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/site/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setImages(prev => prev.filter(i => i.id !== id));
      toast.success("Image deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Gallery</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{images.length} images</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <FormField label="Image URL *" className="flex-1">
            <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." required />
          </FormField>
          <FormField label="Caption" className="flex-1">
            <Input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Optional caption" />
          </FormField>
          <FormField label="Order" className="w-24">
            <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} placeholder="0" />
          </FormField>
          <Button type="submit" disabled={saving}><Plus className="w-3.5 h-3.5" />{saving ? "Adding..." : "Add Image"}</Button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image} alt={img.caption ?? ""} className="w-full h-36 object-cover" />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/90 text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="p-2 text-xs text-muted-foreground truncate">{img.caption || "-"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
