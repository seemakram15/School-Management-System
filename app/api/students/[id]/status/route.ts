import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { status } = await request.json();
  await supabase.from("registrations").update({ status: status ? 1 : 0 }).eq("id", parseInt(id));
  return NextResponse.json({ ok: true });
}
