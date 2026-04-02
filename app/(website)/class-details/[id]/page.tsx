import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ClassProfile = { id: number; description: string | null; image: string | null; i_classes: { id: number; name: string } | null };
type Subject = { id: number; name: string; type: string };
type Section = { id: number; name: string; capacity: number | null };

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classId = parseInt(id);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("class_profiles")
    .select("id, description, image, i_classes(id, name)")
    .eq("class_id", classId)
    .eq("status", 1)
    .maybeSingle();

  if (!profile) notFound();
  const classProfile = profile as unknown as ClassProfile;

  const [subjects, sections] = await Promise.all([
    supabase.from("subjects").select("id, name, type").eq("class_id", classId),
    supabase.from("sections").select("id, name, capacity").eq("class_id", classId).is("deleted_at", null),
  ]);

  const subjectRows = (subjects.data ?? []) as unknown as Subject[];
  const sectionRows = (sections.data ?? []) as unknown as Section[];

  return (
    <>
      <section className="bg-[hsl(var(--sidebar))] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold">{classProfile.i_classes?.name}</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          {classProfile.image && (
            <div className="relative h-64 rounded-xl overflow-hidden bg-muted">
              <Image src={classProfile.image} alt={classProfile.i_classes?.name ?? ""} fill className="object-cover" unoptimized />
            </div>
          )}
          {classProfile.description && (
            <p className="text-muted-foreground leading-relaxed">{classProfile.description}</p>
          )}
        </div>

        <div className="space-y-8">
          {subjectRows.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <h3 className="font-semibold text-foreground mb-3">Subjects</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {subjectRows.map(s => <li key={s.id}>{s.name}</li>)}
              </ul>
            </div>
          )}
          {sectionRows.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <h3 className="font-semibold text-foreground mb-3">Sections</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {sectionRows.map(s => <li key={s.id}>{s.name}{s.capacity ? ` (capacity ${s.capacity})` : ""}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
