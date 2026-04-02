import { createClient } from "@/lib/supabase/server";
import AboutForm from "./AboutForm";

export default async function AboutContentPage() {
  const supabase = await createClient();
  const [{ data: about }, { data: images }] = await Promise.all([
    supabase.from("about_content").select("id, title, description").eq("id", 1).single(),
    supabase.from("about_content_images").select('id, image, caption, "order"').order("order"),
  ]);

  return (
    <AboutForm
      about={(about as { id: number; title: string; description: string | null }) ?? { id: 1, title: "About Us", description: "" }}
      images={(images ?? []) as { id: number; image: string; caption: string | null; order: number }[]}
    />
  );
}
