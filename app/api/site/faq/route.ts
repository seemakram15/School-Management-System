import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, order, status")
    .order("order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { question, answer, order, status } = body;
  if (!question || !answer) return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });

  const { data, error } = await supabase
    .from("faqs")
    .insert({ question, answer, order: order ?? 0, status: status ?? 1 } as never)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
