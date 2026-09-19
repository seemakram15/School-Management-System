import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SchoolLandingClient from "./SchoolLandingClient";

type Props = { params: Promise<{ slug: string }> };

async function getSchoolData(slug: string) {
  const supabase = await createClient();

  const { data: school } = await supabase
    .from("schools")
    .select("id, name, slug, tagline, description, address, phone, email, logo_url")
    .eq("slug", slug)
    .eq("status", 1)
    .single();

  if (!school) return null;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, plans(name)")
    .eq("school_id", school.id)
    .eq("status", "approved")
    .single();

  if (!sub) return null;

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user ? (
    await supabase.from("schools").select("id").eq("id", school.id).eq("owner_id", user.id).single()
  ).data !== null : false;

  const [students, employees, slides, principal, events, achievements] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", school.id).eq("status", 1),
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("school_id", school.id).eq("status", 1),
    supabase.from("school_hero_slides").select("*").eq("school_id", school.id).order("order"),
    supabase.from("school_principal").select("*").eq("school_id", school.id).single(),
    supabase.from("school_events").select("*").eq("school_id", school.id).eq("status", 1).order("event_date", { ascending: false }).limit(6),
    supabase.from("school_achievements").select("*").eq("school_id", school.id).eq("status", 1).order("order").limit(8),
  ]);

  return {
    school: {
      ...school,
      planName: (sub.plans as any)?.name,
      stats: { students: students.count ?? 0, staff: employees.count ?? 0 },
    },
    slides: slides.data ?? [],
    principal: principal.data ?? null,
    events: events.data ?? [],
    achievements: achievements.data ?? [],
    isOwner,
  };
}

export default async function SchoolPublicPage({ params }: Props) {
  const { slug } = await params;
  const data = await getSchoolData(slug);
  if (!data) notFound();

  return <SchoolLandingClient {...data} />;
}
