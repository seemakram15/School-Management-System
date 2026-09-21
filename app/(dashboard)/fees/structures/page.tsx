import { createClient } from "@/lib/supabase/server";
import { FeeStructuresClient } from "./FeeStructuresClient";

export default async function FeeStructuresPage() {
  const supabase = await createClient();
  const [{ data: structures }, { data: feeTypes }, { data: classes }, { data: years }] = await Promise.all([
    supabase.from("fee_structures").select("id, amount, frequency, due_day, fee_types(name), i_classes(name), academic_years(title)").order("id"),
    supabase.from("fee_types").select("id, name").eq("status", 1).order("name"),
    supabase.from("i_classes").select("id, name").order("name"),
    supabase.from("academic_years").select("id, title").order("id", { ascending: false }),
  ]);

  return (
    <FeeStructuresClient
      initialStructures={(structures ?? []) as any[]}
      feeTypes={feeTypes ?? []}
      classes={classes ?? []}
      years={years ?? []}
    />
  );
}
