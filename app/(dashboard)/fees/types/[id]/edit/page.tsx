import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeeTypeEditForm from "./FeeTypeEditForm";

export default async function EditFeeTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: type } = await supabase
    .from("fee_types")
    .select("id, name, description, status")
    .eq("id", parseInt(id))
    .single();

  if (!type) redirect("/fees/types");

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Edit Fee Type</h2>
        <p className="text-sm text-muted-foreground">Update fee category details</p>
      </div>
      <FeeTypeEditForm type={type} />
    </div>
  );
}
