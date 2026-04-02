import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

type ClassProfile = { id: number; description: string | null; image: string | null; i_classes: { id: number; name: string } | null };

export default async function ClassListPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_profiles")
    .select("id, description, image, i_classes(id, name)")
    .eq("status", 1);

  const classRows = (data ?? []) as unknown as ClassProfile[];

  return (
    <>
      <section className="bg-[hsl(var(--sidebar))] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Our Classes</h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">Explore the classes we offer, from foundational years to advanced levels.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {classRows.length === 0 ? (
          <p className="text-center text-muted-foreground">No classes available right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {classRows.map(c => (
              <Link key={c.id} href={`/class-details/${c.i_classes?.id ?? c.id}`} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition">
                {c.image && (
                  <div className="relative h-40">
                    <Image src={c.image} alt={c.i_classes?.name ?? ""} fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{c.i_classes?.name}</h3>
                  {c.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
