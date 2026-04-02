import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("newsletter_subscribers").select("id, email, created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const { email } = await request.json();
  if (!email || typeof email !== "string") return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const { error } = await supabase.from("newsletter_subscribers").insert({ email } as never);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
