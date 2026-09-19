import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  GraduationCap, MapPin, Phone, Mail, Users,
  BookOpen, Award, ArrowRight, CheckCircle2
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

async function getSchoolData(slug: string) {
  const supabase = await createClient();
  const { data: school } = await supabase
    .from("schools")
    .select("id, name, slug, tagline, description, address, phone, email, logo_url, hero_image_url")
    .eq("slug", slug)
    .eq("status", 1)
    .single();

  if (!school) return null;

  // Check subscription is approved
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, plans(name)")
    .eq("school_id", school.id)
    .eq("status", "approved")
    .single();

  if (!sub) return null;

  // Get stats
  const [students, employees] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", school.id).eq("status", 1),
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("school_id", school.id).eq("status", 1),
  ]);

  return {
    ...school,
    planName: (sub.plans as any)?.name,
    stats: {
      students: students.count ?? 0,
      staff: employees.count ?? 0,
    },
  };
}

export default async function SchoolPublicPage({ params }: Props) {
  const { slug } = await params;
  const school = await getSchoolData(slug);
  if (!school) notFound();

  const initials = school.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {school.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logo_url} alt={school.name} className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
            <span className="font-bold text-slate-900 text-lg">{school.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {school.phone && (
              <a href={`tel:${school.phone}`} className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                <Phone className="w-4 h-4" />
                {school.phone}
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-300 blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
            Verified on Schoolly
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">{school.name}</h1>
          {school.tagline && <p className="mt-4 text-xl text-indigo-100">{school.tagline}</p>}
          {school.description && (
            <p className="mt-4 text-indigo-200 max-w-2xl mx-auto leading-relaxed">{school.description}</p>
          )}

          {/* Stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: Users, val: school.stats.students > 0 ? `${school.stats.students}+` : "Growing", label: "Students" },
              { icon: BookOpen, val: school.stats.staff > 0 ? `${school.stats.staff}+` : "Expert", label: "Staff Members" },
              { icon: Award, val: school.planName ?? "Premium", label: "Schoolly Plan" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <s.icon className="w-6 h-6 text-white/80" />
                </div>
                <p className="text-2xl font-extrabold">{s.val}</p>
                <p className="text-indigo-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      {school.description && (
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">About {school.name}</h2>
          <p className="text-slate-600 leading-relaxed text-lg">{school.description}</p>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-10">Why choose us?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Users,      title: "Experienced Faculty",  desc: "Qualified and dedicated teachers committed to student success." },
              { icon: BookOpen,   title: "Modern Curriculum",    desc: "Up-to-date syllabus aligned with national education standards." },
              { icon: Award,      title: "Track Record",          desc: "Consistently strong academic results and extracurricular achievements." },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Get in touch</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {school.phone && (
            <a href={`tel:${school.phone}`} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-semibold text-slate-900 text-sm">{school.phone}</p>
              </div>
            </a>
          )}
          {school.email && (
            <a href={`mailto:${school.email}`} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-semibold text-slate-900 text-sm truncate">{school.email}</p>
              </div>
            </a>
          )}
          {school.address && (
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Address</p>
                <p className="font-semibold text-slate-900 text-sm">{school.address}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} {school.name}</p>
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <Link href="/" className="flex items-center gap-1.5 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              <GraduationCap className="w-4 h-4" />
              Schoolly
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
