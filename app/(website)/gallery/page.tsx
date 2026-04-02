import { createClient } from "@/lib/supabase/server";
import { PublicShell } from "@/components/website/PublicShell";

type GalleryImage = { id: number; image: string; caption: string | null };

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_images")
    .select("id, image, caption")
    .eq("status", 1)
    .order("order");

  const images = (data ?? []) as unknown as GalleryImage[];

  return (
    <PublicShell>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-foreground text-center mb-10">Gallery</h1>
        {images.length === 0 ? (
          <p className="text-center text-muted-foreground">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map(img => (
              <div key={img.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <img src={img.image} alt={img.caption ?? ""} className="w-full h-48 object-cover" />
                {img.caption && <p className="p-3 text-sm text-muted-foreground">{img.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
