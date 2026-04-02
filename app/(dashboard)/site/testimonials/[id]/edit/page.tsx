import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TestimonialEditForm from "./TestimonialEditForm";

export default async function TestimonialEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, name, designation, message, photo, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <TestimonialEditForm testimonial={data} />;
}
