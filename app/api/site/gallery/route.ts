import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id, image, caption, order, status")
    .order("order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { image, caption, order } = body;
  if (!image) return NextResponse.json({ error: "Image URL is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("gallery_images")
    .insert({ image, caption: caption || null, order: order ?? 0 } as never)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
