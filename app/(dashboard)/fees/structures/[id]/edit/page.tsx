import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StructureEditForm from "./StructureEditForm";

export default async function EditStructurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: structure } = await supabase
    .from("fee_structures")
    .select("id, amount, frequency, due_day, fee_types(name), i_classes(name), academic_years(title)")
    .eq("id", parseInt(id))
    .single();

  if (!structure) redirect("/fees/structures");

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Edit Fee Structure</h2>
        <p className="text-sm text-muted-foreground">Update amount, frequency, or due day</p>
      </div>
      <StructureEditForm structure={structure} />
    </div>
  );
}
