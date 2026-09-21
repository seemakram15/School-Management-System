import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";

export default async function SiteSettingsPage() {
  const supabase = await createClient();
  const { data: metas } = await supabase.from("site_metas").select("meta_key, meta_value");

  const meta: Record<string, string> = {};
  ((metas ?? []) as unknown as { meta_key: string; meta_value: string | null }[]).forEach(m => { meta[m.meta_key] = m.meta_value ?? ""; });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Site Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage public website settings</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form className="space-y-4" action="/api/site/settings" method="POST">
          <FormField label="Site Tagline">
            <Input name="site_tagline" defaultValue={meta.site_tagline} placeholder="Excellence in Education" />
          </FormField>
          <FormField label="Analytics Code">
            <Textarea name="analytics_code" rows={4} defaultValue={meta.analytics_code} placeholder="Paste your Google Analytics / tracking snippet" />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Facebook URL">
              <Input name="facebook_url" defaultValue={meta.facebook_url} placeholder="https://facebook.com/yourschool" />
            </FormField>
            <FormField label="Twitter URL">
              <Input name="twitter_url" defaultValue={meta.twitter_url} placeholder="https://twitter.com/yourschool" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="YouTube URL">
              <Input name="youtube_url" defaultValue={meta.youtube_url} placeholder="https://youtube.com/yourschool" />
            </FormField>
            <FormField label="LinkedIn URL">
              <Input name="linkedin_url" defaultValue={meta.linkedin_url} placeholder="https://linkedin.com/company/yourschool" />
            </FormField>
          </div>
          <Button type="submit">Save Settings</Button>
        </form>
      </div>
    </div>
  );
}
