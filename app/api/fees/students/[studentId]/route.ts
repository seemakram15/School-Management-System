import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { studentId } = await params;

  const { data: student } = await supabase
    .from("students")
    .select("id, name, photo, father_name, phone_no")
    .eq("id", parseInt(studentId))
    .single();

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const { data: registration } = await supabase
    .from("registrations")
    .select("id, roll_no, i_classes(name), sections(name)")
    .eq("student_id", parseInt(studentId))
    .eq("status", 1)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const invoicesResult = registration ? await supabase
    .from("fee_invoices")
    .select("id, invoice_no, month, year, amount, discount, fine, net_amount, due_date, status, fee_types(name), fee_payments(id, amount, payment_date, payment_method)")
    .eq("registration_id", registration.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false }) : { data: [] };

  return NextResponse.json({ student, registration, invoices: invoicesResult.data ?? [] });
}
