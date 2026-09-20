import { createClient } from "@/lib/supabase/server";
import GenerateForm from "./GenerateForm";

export default async function GenerateInvoicesPage() {
  const supabase = await createClient();
  const [{ data: feeTypes }, { data: classes }, { data: years }] = await Promise.all([
    supabase.from("fee_types").select("id, name").eq("status", 1).order("name"),
    supabase.from("i_classes").select("id, name").order("numeric_value"),
    supabase.from("academic_years").select("id, title, is_running").order("created_at", { ascending: false }),
  ]);

  const runningYear = (years ?? []).find((y: any) => y.is_running)?.id;

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Generate Fee Invoices</h2>
        <p className="text-sm text-muted-foreground">Bulk-create invoices for all active students in a class. Already-existing invoices are skipped.</p>
      </div>
      <GenerateForm feeTypes={feeTypes ?? []} classes={classes ?? []} years={years ?? []} defaultYearId={runningYear} />
    </div>
  );
}
