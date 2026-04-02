import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EventEditForm from "./EventEditForm";

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, description, start_date, end_date, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <EventEditForm event={data} />;
}
