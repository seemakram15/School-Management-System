import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SliderEditForm from "./SliderEditForm";

export default async function SliderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("sliders")
    .select("id, title, sub_title, image, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <SliderEditForm slider={data} />;
}
