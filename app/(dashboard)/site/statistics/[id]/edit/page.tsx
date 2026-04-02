import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StatisticEditForm from "./StatisticEditForm";

export default async function StatisticEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("statistics")
    .select('id, label, value, icon, "order", status')
    .eq("id", parseInt(id))
    .single();

  if (!data) notFound();

  return <StatisticEditForm statistic={data} />;
}
