import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FaqEditForm from "./FaqEditForm";

export default async function FaqEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, order, status")
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <FaqEditForm faq={data} />;
}
