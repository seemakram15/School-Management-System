import { createClient } from "@/lib/supabase/server";
import SchoolLandingClient from "../[slug]/SchoolLandingClient";

// Visual preview of the school landing page with demo data — no DB required
export default async function LandingPreview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user
    ? !!(await supabase.from("users").select("is_service_provider").eq("id", user.id).single()).data?.is_service_provider
    : false;

  return (
    <SchoolLandingClient
      isOwner={isOwner}
      school={{
        id: "preview",
        name: "Al-Noor Public School",
        slug: "_preview",
        tagline: "Nurturing Excellence, Building Futures",
        description: "Al-Noor Public School has been a beacon of educational excellence in our community since 2005. We combine rigorous academics with character development, ensuring every student reaches their full potential in a caring and stimulating environment.",
        address: "Plot 45, Education City, Lahore, Pakistan",
        phone: "+92 300 1234567",
        email: "info@alnoorschool.edu.pk",
        logo_url: null,
        stats: { students: 1240, staff: 68 },
        planName: "Premium",
      }}
      slides={[]}
      principal={{
        name: "Dr. Amna Khalid",
        title: "Principal",
        message: "Education is not preparation for life; education is life itself. At Al-Noor, we believe every child carries within them a unique spark of genius. Our dedicated faculty and nurturing environment exist to fan that spark into a brilliant flame. We are committed to producing not just academically excellent graduates, but responsible, compassionate citizens who will lead our nation forward. Welcome to our school family.",
        photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      }}
      events={[]}
      achievements={[]}
    />
  );
}
