import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ schoolId: string }> };

async function assertOwner(supabase: Awaited<ReturnType<typeof createClient>>, schoolId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("schools")
    .select("id")
    .eq("id", schoolId)
    .eq("owner_id", user.id)
    .single();
  return !!data;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_hero_slides")
    .select("*")
    .eq("school_id", schoolId)
    .order("order");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  if (!(await assertOwner(supabase, schoolId)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("school_hero_slides")
    .insert({ school_id: schoolId, image_url: body.image_url, caption: body.caption ?? null, order: body.order ?? 0 })
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

  const slides: { id: string; image_url: string; caption?: string; order: number }[] = await req.json();
  // Bulk replace: delete existing then insert new
  await supabase.from("school_hero_slides").delete().eq("school_id", schoolId);
  if (slides.length > 0) {
    const { error } = await supabase.from("school_hero_slides").insert(
      slides.map((s, i) => ({ school_id: schoolId, image_url: s.image_url, caption: s.caption ?? null, order: i }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { schoolId } = await params;
  const supabase = await createClient();
  if (!(await assertOwner(supabase, schoolId)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await req.json();
  const { error } = await supabase.from("school_hero_slides").delete().eq("id", id).eq("school_id", schoolId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
