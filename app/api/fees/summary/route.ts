import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [invoicesResult, paymentsResult, recentResult] = await Promise.all([
    supabase.from("fee_invoices").select("net_amount, status, due_date"),
    supabase.from("fee_payments").select("amount"),
    supabase.from("fee_payments")
      .select("amount, payment_date, payment_method, fee_invoices(invoice_no, fee_types(name), registrations(students(name), i_classes(name)))")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const invoices = (invoicesResult.data ?? []) as { net_amount: number; status: string; due_date: string }[];
  const total_collected = (paymentsResult.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const total_pending = invoices
    .filter(i => i.status === "unpaid" || i.status === "partial")
    .reduce((s, i) => s + Number(i.net_amount), 0);
  const total_overdue = invoices
    .filter(i => (i.status === "unpaid" || i.status === "partial") && i.due_date < today)
    .reduce((s, i) => s + Number(i.net_amount), 0);

  return NextResponse.json({
    total_collected,
    total_pending,
    total_overdue,
    total_invoices: invoices.length,
    recent_payments: recentResult.data ?? [],
  });
}
