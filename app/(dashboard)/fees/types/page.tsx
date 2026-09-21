import { createClient } from "@/lib/supabase/server";
import { FeeTypesClient } from "./FeeTypesClient";

export default async function FeeTypesPage() {
  const supabase = await createClient();
  const { data: types } = await supabase
    .from("fee_types")
    .select("id, name, description, status")
    .order("name");

  return <FeeTypesClient initialTypes={types ?? []} />;
}
