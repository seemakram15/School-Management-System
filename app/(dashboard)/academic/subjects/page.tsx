import { createClient } from "@/lib/supabase/server";
import { SubjectsClient } from "./SubjectsClient";

export default async function SubjectsPage() {
  const supabase = await createClient();
  const [{ data: subjects }, { data: classes }] = await Promise.all([
    supabase.from("subjects").select("id, name, code, type, status, class_id, i_classes(name)").is("deleted_at", null).order("name"),
    supabase.from("i_classes").select("id, name").eq("status", 1).order("numeric_value"),
  ]);

  return <SubjectsClient initialRows={(subjects ?? []) as any[]} classes={classes ?? []} />;
}
