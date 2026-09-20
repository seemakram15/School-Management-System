import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { invoice_id, amount, payment_method, payment_date, reference_no, note } = await request.json();

  if (!invoice_id || !amount || parseFloat(amount) <= 0) {
    return NextResponse.json({ error: "invoice_id and a positive amount are required" }, { status: 400 });
  }

  // Get invoice to check net_amount and current paid total
  const { data: invoice, error: invErr } = await supabase
    .from("fee_invoices")
    .select("id, net_amount, status, fee_payments(amount)")
    .eq("id", parseInt(invoice_id))
    .single();

  if (invErr || !invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "paid" || invoice.status === "waived") {
    return NextResponse.json({ error: "Invoice is already settled" }, { status: 400 });
  }

  const { data: payment, error: pErr } = await supabase
    .from("fee_payments")
    .insert({
      invoice_id: parseInt(invoice_id),
      amount: parseFloat(amount),
      payment_date: payment_date || new Date().toISOString().slice(0, 10),
      payment_method: payment_method || "cash",
      reference_no: reference_no || null,
      note: note || null,
      collected_by: user?.id || null,
    })
    .select("id")
    .single();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Recalculate total paid and update invoice status
  const previousPaid = (invoice.fee_payments as { amount: number }[])
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = previousPaid + parseFloat(amount);

  const newStatus = totalPaid >= Number(invoice.net_amount) ? "paid" : "partial";
  await supabase
    .from("fee_invoices")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", parseInt(invoice_id));

  return NextResponse.json({ id: payment.id, status: newStatus }, { status: 201 });
}
