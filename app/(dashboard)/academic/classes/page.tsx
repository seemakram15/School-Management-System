import { createClient } from "@/lib/supabase/server";
import { ClassesClient } from "./ClassesClient";

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("i_classes")
    .select("id, name, numeric_value, have_selective_subject, have_elective_subject, status")
    .order("numeric_value", { ascending: true, nullsFirst: false });

  return <ClassesClient initialRows={(data ?? []) as any[]} />;
}
