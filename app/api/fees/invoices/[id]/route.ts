import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  return user;
}

const VALID_STATUSES = new Set(["unpaid", "partial", "paid", "waived"]);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, amount, discount, fine, net_amount,
      due_date, status, note, created_at,
      fee_types(name),
      registrations(
        id, roll_no,
        students(id, name, phone_no, father_name),
        i_classes(name), sections(name)
      ),
      fee_payments(id, amount, payment_date, payment_method, reference_no, note, created_at)
    `)
    .eq("id", parseInt(id))
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.fine != null) updates.fine = parseFloat(body.fine);
  if (body.note != null) updates.note = body.note;
  if (body.status) {
    if (!VALID_STATUSES.has(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    updates.status = body.status;
  }

  const { error } = await supabase.from("fee_invoices").update(updates).eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}
