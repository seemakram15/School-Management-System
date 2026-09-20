import { createClient } from "@/lib/supabase/server";
import NewStructureForm from "./NewStructureForm";

export default async function NewFeeStructurePage() {
  const supabase = await createClient();
  const [{ data: feeTypes }, { data: classes }, { data: years }] = await Promise.all([
    supabase.from("fee_types").select("id, name").eq("status", 1).order("name"),
    supabase.from("i_classes").select("id, name").order("numeric_value"),
    supabase.from("academic_years").select("id, title").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">New Fee Structure</h2>
        <p className="text-sm text-muted-foreground">Assign an amount to a class and academic year</p>
      </div>
      <NewStructureForm feeTypes={feeTypes ?? []} classes={classes ?? []} years={years ?? []} />
    </div>
  );
}
