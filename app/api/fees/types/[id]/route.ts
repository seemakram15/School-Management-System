import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  return user;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { id } = await params;
  const { name, description, status } = await request.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { error } = await supabase
    .from("fee_types")
    .update({ name: name.trim(), description: description?.trim() || null, status: parseInt(status ?? "1"), updated_at: new Date().toISOString() })
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { id } = await params;

  const { error } = await supabase
    .from("fee_types")
    .update({ status: 0, updated_at: new Date().toISOString() })
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
