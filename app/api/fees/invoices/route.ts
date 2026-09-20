import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  return user;
}

export async function GET(request: NextRequest) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const status = searchParams.get("status");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const registrationId = searchParams.get("registration_id");
  const overdue = searchParams.get("overdue");
  const limit = parseInt(searchParams.get("limit") ?? "200");

  let query = supabase
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, amount, discount, fine, net_amount,
      due_date, status, note, created_at, registration_id, fee_type_id,
      fee_types(name),
      registrations(
        id, roll_no, class_id,
        students(id, name, photo),
        i_classes(name),
        sections(name)
      ),
      fee_payments(amount)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (month) query = query.eq("month", parseInt(month));
  if (year) query = query.eq("year", parseInt(year));
  if (registrationId) query = query.eq("registration_id", parseInt(registrationId));
  if (overdue === "1") {
    const today = new Date().toISOString().slice(0, 10);
    query = query.lt("due_date", today).in("status", ["unpaid", "partial"]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by class_id post-join since Supabase can't filter on joined columns in all versions
  let result = data ?? [];
  if (classId) {
    result = result.filter((inv: any) => inv.registrations?.class_id === parseInt(classId));
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { class_id, academic_year_id, fee_type_id, month, year } = await request.json();

  if (!class_id || !academic_year_id || !fee_type_id || !month || !year) {
    return NextResponse.json({ error: "class_id, academic_year_id, fee_type_id, month, year are required" }, { status: 400 });
  }

  // Get fee structure for this class+year+type
  const { data: structure } = await supabase
    .from("fee_structures")
    .select("amount, due_day")
    .eq("class_id", parseInt(class_id))
    .eq("academic_year_id", parseInt(academic_year_id))
    .eq("fee_type_id", parseInt(fee_type_id))
    .single();

  if (!structure) return NextResponse.json({ error: "No fee structure found for this class/year/type combination" }, { status: 404 });

  // Get all active registrations for this class+year
  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, student_id")
    .eq("class_id", parseInt(class_id))
    .eq("academic_year_id", parseInt(academic_year_id))
    .eq("status", 1);

  if (!registrations?.length) return NextResponse.json({ created: 0, skipped: 0 });

  const dueDate = `${year}-${String(month).padStart(2, "0")}-${String(structure.due_day).padStart(2, "0")}`;
  let created = 0;
  let skipped = 0;

  for (const reg of registrations) {
    // Check if invoice already exists
    const { data: existing } = await supabase
      .from("fee_invoices")
      .select("id")
      .eq("registration_id", reg.id)
      .eq("fee_type_id", parseInt(fee_type_id))
      .eq("month", parseInt(month))
      .eq("year", parseInt(year))
      .maybeSingle();

    if (existing) { skipped++; continue; }

    // Get discount for this student+fee_type if any
    const { data: discount } = await supabase
      .from("fee_discounts")
      .select("discount_type, discount_value")
      .eq("registration_id", reg.id)
      .eq("fee_type_id", parseInt(fee_type_id))
      .maybeSingle();

    let discountAmount = 0;
    if (discount) {
      discountAmount = discount.discount_type === "percent"
        ? (structure.amount * discount.discount_value) / 100
        : discount.discount_value;
    }

    const invoiceNo = `INV-${year}${String(month).padStart(2, "0")}-${String(reg.id).padStart(5, "0")}`;

    const { error } = await supabase.from("fee_invoices").insert({
      registration_id: reg.id,
      fee_type_id: parseInt(fee_type_id),
      academic_year_id: parseInt(academic_year_id),
      invoice_no: invoiceNo,
      month: parseInt(month),
      year: parseInt(year),
      amount: structure.amount,
      discount: discountAmount,
      fine: 0,
      due_date: dueDate,
      status: "unpaid",
    });

    if (!error) created++;
  }

  return NextResponse.json({ created, skipped });
}
