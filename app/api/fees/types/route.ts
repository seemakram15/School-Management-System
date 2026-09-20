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
  const status = searchParams.get("status") ?? "1";

  const query = supabase
    .from("fee_types")
    .select("id, name, description, status, created_at")
    .order("name");

  const { data, error } = status === "all"
    ? await query
    : await query.eq("status", parseInt(status));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!await requireAuth()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const { name, description } = await request.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("fee_types")
    .insert({ name: name.trim(), description: description?.trim() || null, status: 1 })
    .select("id, name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
