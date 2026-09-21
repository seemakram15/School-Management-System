import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { invoice_id, amount, payment_method, payment_date, reference_no, note } = await request.json();

  if (!invoice_id || !amount || parseFloat(amount) <= 0) {
    return NextResponse.json({ error: "invoice_id and a positive amount are required" }, { status: 400 });
  }

  const { data: invoice, error: invErr } = await supabase
    .from("fee_invoices")
    .select("id, invoice_no, net_amount, status, school_id, fee_payments(amount), registrations(students(name))")
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

  const previousPaid = (invoice.fee_payments as { amount: number }[])
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = previousPaid + parseFloat(amount);
  const newStatus = totalPaid >= Number(invoice.net_amount) ? "paid" : "partial";

  await supabase
    .from("fee_invoices")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", parseInt(invoice_id));

  const studentName = (invoice.registrations as any)?.students?.name ?? "Student";
  const notifType = newStatus === "paid" ? "fee_paid" : "fee_partial";
  const msg = newStatus === "paid"
    ? `Fee fully paid for ${studentName} — Invoice #${invoice.invoice_no}`
    : `Partial payment of PKR ${parseFloat(amount).toLocaleString()} recorded for ${studentName}`;

  await createNotification({
    type: notifType,
    notifiable_id: user.id,
    school_id: (invoice as any).school_id ?? undefined,
    message: msg,
    link: `/fees/invoices/${invoice_id}`,
    meta: { invoice_id, amount: parseFloat(amount), status: newStatus },
  });

  return NextResponse.json({ id: payment.id, status: newStatus }, { status: 201 });
}
