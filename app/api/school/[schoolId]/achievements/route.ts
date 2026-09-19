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
    .from("school_achievements")
    .select("*")
    .eq("school_id", schoolId)
    .eq("status", 1)
    .order("order");
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  if (!(await assertOwner(supabase, schoolId)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("school_achievements")
    .insert({ school_id: schoolId, title: body.title, description: body.description ?? null, year: body.year ?? null, icon: body.icon ?? "trophy", order: body.order ?? 0 })
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
    .from("school_achievements")
    .update({ title: body.title, description: body.description, year: body.year, icon: body.icon, order: body.order, updated_at: new Date().toISOString() })
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
  await supabase.from("school_achievements").update({ status: 0 }).eq("id", id).eq("school_id", schoolId);
  return NextResponse.json({ ok: true });
}
