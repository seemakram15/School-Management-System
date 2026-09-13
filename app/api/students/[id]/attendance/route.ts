import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("student_attendances")
    .select("attendance_date, status")
    .eq("registration_id", parseInt(id))
    .order("attendance_date", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
