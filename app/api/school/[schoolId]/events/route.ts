import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ schoolId: string }> };

async function assertOwner(supabase: Awaited<ReturnType<typeof createClient>>, schoolId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("schools").select("id").eq("id", schoolId).eq("owner_id", user.id).single();
  return !!data;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("school_events")
    .select("*")
    .eq("school_id", schoolId)
    .eq("status", 1)
    .order("event_date", { ascending: false })
    .limit(6);
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  if (!(await assertOwner(supabase, schoolId)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("school_events")
    .insert({ school_id: schoolId, title: body.title, description: body.description ?? null, event_date: body.event_date ?? null, image_url: body.image_url ?? null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  if (!(await assertOwner(supabase, schoolId)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("school_events")
    .update({ title: body.title, description: body.description, event_date: body.event_date, image_url: body.image_url, updated_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("school_id", schoolId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  if (!(await assertOwner(supabase, schoolId)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await req.json();
  await supabase.from("school_events").update({ status: 0 }).eq("id", id).eq("school_id", schoolId);
  return NextResponse.json({ ok: true });
}
