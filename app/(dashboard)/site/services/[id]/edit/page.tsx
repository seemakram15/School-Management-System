import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ServiceEditForm from "./ServiceEditForm";

export default async function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select('id, title, description, icon, "order", status')
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <ServiceEditForm service={data} />;
}
