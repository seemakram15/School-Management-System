import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("registration_subjects")
    .select("type, subjects(name, code)")
    .eq("registration_id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map(r => ({ name: (r.subjects as unknown as { name: string; code: string })?.name, code: (r.subjects as unknown as { name: string; code: string })?.code, type: r.type }))
  );
}
