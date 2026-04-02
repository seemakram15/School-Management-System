import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PublicShell } from "@/components/website/PublicShell";
import { formatDate } from "@/lib/utils";

type Slider = { id: number; title: string; sub_title: string | null; image: string | null };
type AboutContent = { title: string; description: string | null };
type Service = { id: number; title: string; description: string | null; icon: string | null };
type Statistic = { id: number; label: string; value: string; icon: string | null };
type Testimonial = { id: number; name: string; designation: string | null; message: string; photo: string | null };
type EventRow = { id: number; title: string; description: string | null; start_date: string };
type ClassProfile = { id: number; description: string | null; image: string | null; i_classes: { id: number; name: string } | null };

export default async function HomePage() {
  const supabase = await createClient();

  const [sliders, about, services, statistics, testimonials, events, classProfiles] = await Promise.all([
    supabase.from("sliders").select("id, title, sub_title, image").eq("status", 1),
    supabase.from("about_content").select("title, description").eq("id", 1).single(),
    supabase.from("services").select("id, title, description, icon").eq("status", 1).order("order"),
    supabase.from("statistics").select("id, label, value, icon").eq("status", 1).order("order"),
    supabase.from("testimonials").select("id, name, designation, message, photo").eq("status", 1).limit(6),
    supabase.from("events").select("id, title, description, start_date").eq("status", 1).order("start_date", { ascending: false }).limit(3),
    supabase.from("class_profiles").select("id, description, image, i_classes(id, name)").eq("status", 1).limit(6),
  ]);

  const sliderRows = (sliders.data ?? []) as unknown as Slider[];
  const aboutRow = about.data as unknown as AboutContent | null;
  const serviceRows = (services.data ?? []) as unknown as Service[];
  const statRows = (statistics.data ?? []) as unknown as Statistic[];
  const testimonialRows = (testimonials.data ?? []) as unknown as Testimonial[];
  const eventRows = (events.data ?? []) as unknown as EventRow[];
  const classRows = (classProfiles.data ?? []) as unknown as ClassProfile[];

  const hero = sliderRows[0];

  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative bg-[hsl(var(--sidebar))] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{hero?.title || "Welcome to our School"}</h1>
            {hero?.sub_title && <p className="mt-4 text-white/70 text-lg">{hero.sub_title}</p>}
            <div className="mt-8 flex gap-3">
              <Link href="/contact-us" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">Get in Touch</Link>
              <Link href="/class" className="px-5 py-2.5 rounded-lg border border-white/20 font-semibold hover:bg-white/10 transition">Explore Classes</Link>
            </div>
          </div>
          {hero?.image && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5">
              <Image src={hero.image} alt={hero.title} fill className="object-cover" unoptimized />
            </div>
          )}
        </div>
      </section>

      {/* Statistics */}
      {statRows.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
          <div className="bg-card rounded-xl border border-border shadow-sm grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {statRows.map(s => (
              <div key={s.id} className="p-6 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      {aboutRow && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground">{aboutRow.title}</h2>
          {aboutRow.description && <p className="mt-4 text-muted-foreground leading-relaxed">{aboutRow.description}</p>}
        </section>
      )}

      {/* Services */}
      {serviceRows.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">What We Offer</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {serviceRows.map(s => (
              <div key={s.id} className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                {s.description && <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Class Profiles preview */}
      {classRows.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Our Classes</h2>
            <Link href="/class" className="text-sm font-medium text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {classRows.map(c => (
              <Link key={c.id} href={`/class-details/${c.i_classes?.id ?? c.id}`} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition">
                {c.image && <div className="relative h-36"><Image src={c.image} alt={c.i_classes?.name ?? ""} fill className="object-cover" unoptimized /></div>}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{c.i_classes?.name}</h3>
                  {c.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Events */}
      {eventRows.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Latest Events</h2>
            <Link href="/events" className="text-sm font-medium text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {eventRows.map(e => (
              <Link key={e.id} href={`/events-details/${e.id}`} className="bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition">
                <p className="text-xs font-medium text-primary">{formatDate(e.start_date)}</p>
                <h3 className="mt-1 font-semibold text-foreground">{e.title}</h3>
                {e.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialRows.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">What People Say</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {testimonialRows.map(t => (
              <div key={t.id} className="bg-card rounded-xl border border-border shadow-sm p-6">
                <p className="text-sm text-muted-foreground italic">&ldquo;{t.message}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    {t.designation && <p className="text-xs text-muted-foreground">{t.designation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
