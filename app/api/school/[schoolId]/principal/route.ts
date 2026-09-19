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
  const { data } = await supabase.from("school_principal").select("*").eq("school_id", schoolId).single();
  return NextResponse.json(data ?? null);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  if (!(await assertOwner(supabase, schoolId)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const payload = {
    school_id: schoolId,
    name: body.name,
    title: body.title ?? "Principal",
    message: body.message,
    photo_url: body.photo_url ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("school_principal")
    .upsert(payload, { onConflict: "school_id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
