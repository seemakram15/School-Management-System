import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("marks")
    .select("total_marks, is_absent, exams(name), subjects(name)")
    .eq("registration_id", parseInt(id))
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map(m => ({
      exam: (m.exams as unknown as { name: string })?.name ?? "—",
      subject: (m.subjects as unknown as { name: string })?.name ?? "—",
      total_marks: m.total_marks,
      is_absent: m.is_absent === 1,
    }))
  );
}
