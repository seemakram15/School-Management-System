import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data: appMetas }, { data: siteMetas }] = await Promise.all([
    supabase.from("app_metas").select("meta_key, meta_value"),
    supabase.from("site_metas").select("meta_key, meta_value"),
  ]);

  const meta: Record<string, string> = {};
  [...(appMetas ?? []), ...(siteMetas ?? [])].forEach(m => {
    const row = m as unknown as { meta_key: string; meta_value: string | null };
    meta[row.meta_key] = row.meta_value ?? "";
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader instituteName={meta.institute_name || "CloudSchool"} />
      <main className="flex-1">{children}</main>
      <PublicFooter
        instituteName={meta.institute_name || "CloudSchool"}
        address={meta.institute_address || ""}
        phone={meta.institute_phone || ""}
        email={meta.institute_email || ""}
        social={{
          facebook: meta.facebook_url || "",
          twitter: meta.twitter_url || "",
          youtube: meta.youtube_url || "",
          linkedin: meta.linkedin_url || "",
        }}
      />
    </div>
  );
}
