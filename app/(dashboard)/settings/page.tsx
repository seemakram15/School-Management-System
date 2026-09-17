import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: metas } = await supabase.from("app_metas").select("meta_key, meta_value");

  const meta: Record<string, string> = {};
  ((metas ?? []) as unknown as { meta_key: string; meta_value: string | null }[]).forEach(m => { meta[m.meta_key] = m.meta_value ?? ""; });

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Institute Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your institute information</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form className="space-y-4" action="/api/settings" method="POST">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Institute Name">
              <Input name="institute_name" defaultValue={meta.institute_name} placeholder="CloudSchool" />
            </FormField>
            <FormField label="Short Name">
              <Input name="institute_short_name" defaultValue={meta.institute_short_name} placeholder="CS" />
            </FormField>
          </div>
          <FormField label="Address">
            <Input name="institute_address" defaultValue={meta.institute_address} placeholder="123 School Street" />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Phone">
              <Input name="institute_phone" defaultValue={meta.institute_phone} placeholder="+1 234 567 8900" />
            </FormField>
            <FormField label="Email">
              <Input name="institute_email" type="email" defaultValue={meta.institute_email} placeholder="info@school.com" />
            </FormField>
          </div>
          <FormField label="Website">
            <Input name="institute_website" defaultValue={meta.institute_website} placeholder="https://school.com" />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Currency">
              <Input name="currency" defaultValue={meta.currency} placeholder="USD" />
            </FormField>
            <FormField label="Date Format">
              <Input name="date_format" defaultValue={meta.date_format} placeholder="Y-m-d" />
            </FormField>
          </div>
          <Button type="submit">Save Settings</Button>
        </form>
      </div>
    </div>
  );
}
