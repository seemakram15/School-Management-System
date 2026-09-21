import { createClient } from "@/lib/supabase/server";
import { SectionsClient } from "./SectionsClient";

export default async function SectionsPage() {
  const supabase = await createClient();
  const [{ data: sections }, { data: classes }] = await Promise.all([
    supabase.from("sections").select("id, name, capacity, status, class_id, i_classes(name)").is("deleted_at", null).order("name"),
    supabase.from("i_classes").select("id, name").eq("status", 1).order("numeric_value"),
  ]);

  return <SectionsClient initialRows={(sections ?? []) as any[]} classes={classes ?? []} />;
}
