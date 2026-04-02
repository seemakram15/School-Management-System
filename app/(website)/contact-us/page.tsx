import { createClient } from "@/lib/supabase/server";
import { PublicShell } from "@/components/website/PublicShell";
import { ContactForm } from "./ContactForm";
import { MapPin, Phone, Mail } from "lucide-react";

export default async function ContactUsPage() {
  const supabase = await createClient();
  const { data: metas } = await supabase.from("app_metas").select("meta_key, meta_value");

  const meta: Record<string, string> = {};
  (metas ?? []).forEach(m => {
    const row = m as unknown as { meta_key: string; meta_value: string | null };
    meta[row.meta_key] = row.meta_value ?? "";
  });

  return (
    <PublicShell>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-foreground text-center mb-10">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4 h-fit">
            <h2 className="font-semibold text-foreground">Get in Touch</h2>
            {meta.institute_address && (
              <p className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />{meta.institute_address}
              </p>
            )}
            {meta.institute_phone && (
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary" />{meta.institute_phone}
              </p>
            )}
            {meta.institute_email && (
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-primary" />{meta.institute_email}
              </p>
            )}
          </div>
          <ContactForm />
        </div>
      </section>
    </PublicShell>
  );
}
