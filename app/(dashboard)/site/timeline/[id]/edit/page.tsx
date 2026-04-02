import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TimelineEditForm from "./TimelineEditForm";

export default async function TimelineEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("timeline_items")
    .select("id, year, title, description, order, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <TimelineEditForm item={data} />;
}
