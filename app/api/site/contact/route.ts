import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("contact_messages").select("id, name, email, subject, message, is_read, created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { name, email, subject, message } = body;
  if (!name || !email || !message) return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });

  const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message } as never);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
