import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const schoolId = formData.get("schoolId") as string | null;

  if (!file || !schoolId) return NextResponse.json({ error: "Missing file or schoolId" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

  // Verify ownership
  const { data: school } = await supabase.from("schools").select("id").eq("id", schoolId).eq("owner_id", user.id).single();
  const { data: spUser } = await supabase.from("users").select("is_service_provider").eq("id", user.id).single();
  if (!school && !spUser?.is_service_provider) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `schools/${schoolId}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from("school-media").upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("school-media").getPublicUrl(path);
  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
