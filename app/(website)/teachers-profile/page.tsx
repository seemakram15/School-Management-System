import Image from "next/image";
import { Facebook, Twitter, Linkedin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

type TeacherProfile = { employee_id: number; about: string | null; facebook: string | null; twitter: string | null; linkedin: string | null };
type Teacher = { id: number; name: string; designation: string | null; photo: string | null; teacher_profiles: TeacherProfile[] | TeacherProfile | null };

export default async function TeachersProfilePage() {
  // `employees` has RLS enabled with a service-role-only policy (no anon/authenticated
  // read policy exists), so the public anon client would always return zero rows here.
  // Admin client is safe: the select below is scoped to public-facing fields only.
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("employees")
    .select("id, name, designation, photo, teacher_profiles(employee_id, about, facebook, twitter, linkedin)")
    .eq("role_id", 3) // teacher role
    .eq("status", 1)
    .is("deleted_at", null)
    .order("name");

  const teachers = (data ?? []) as unknown as Teacher[];

  const profileOf = (t: Teacher): TeacherProfile | null =>
    Array.isArray(t.teacher_profiles) ? t.teacher_profiles[0] ?? null : t.teacher_profiles;

  return (
    <>
      <section className="bg-[hsl(var(--sidebar))] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Our Teachers</h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">Meet the educators who make our school great.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {teachers.length === 0 ? (
          <p className="text-center text-muted-foreground">No teachers to show right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teachers.map(t => {
              const profile = profileOf(t);
              return (
                <div key={t.id} className="bg-card rounded-xl border border-border shadow-sm p-6 text-center">
                  <div className="mx-auto w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center relative">
                    {t.photo ? (
                      <Image src={t.photo} alt={t.name} fill className="object-cover" unoptimized />
                    ) : (
                      <span className="text-primary font-semibold text-2xl">{t.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{t.name}</h3>
                  {t.designation && <p className="text-sm text-muted-foreground">{t.designation}</p>}
                  {profile?.about && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{profile.about}</p>}
                  {(profile?.facebook || profile?.twitter || profile?.linkedin) && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      {profile.facebook && (
                        <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition">
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                      {profile.twitter && (
                        <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
