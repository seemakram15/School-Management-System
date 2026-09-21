import { createClient } from "@/lib/supabase/server";
import { InvoicesClient } from "./InvoicesClient";

const STATUS_VARIANTS: Record<string, "default" | "danger" | "warning" | "success" | "info"> = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
  waived: "info",
};

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string; month?: string; year?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date();

  let query = supabase
    .from("fee_invoices")
    .select(`id, invoice_no, month, year, net_amount, due_date, status, fee_types(name), registrations(students(name), i_classes(name))`)
    .order("created_at", { ascending: false })
    .limit(200);

  if (sp.status) query = query.eq("status", sp.status);
  if (sp.month) query = query.eq("month", parseInt(sp.month));
  if (sp.year) query = query.eq("year", parseInt(sp.year));

  const [{ data: invoices }, { data: feeTypes }, { data: classes }, { data: years }] = await Promise.all([
    query,
    supabase.from("fee_types").select("id, name").eq("status", 1).order("name"),
    supabase.from("i_classes").select("id, name").order("name"),
    supabase.from("academic_years").select("id, title").order("id", { ascending: false }),
  ]);

  return (
    <InvoicesClient
      invoices={(invoices ?? []) as any[]}
      feeTypes={feeTypes ?? []}
      classes={classes ?? []}
      years={years ?? []}
      filters={sp}
      statusVariants={STATUS_VARIANTS}
      months={MONTHS}
      currentYear={today.getFullYear()}
    />
  );
}
