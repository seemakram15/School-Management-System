import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

// Magic bytes for jpeg / png / webp
function sniffMime(buf: Uint8Array): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return "image/webp";
  return null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Sniff actual bytes — ignore client-supplied file.type
  const mime = sniffMime(bytes);
  if (!mime || !ALLOWED[mime]) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are accepted" }, { status: 400 });
  }

  const ext = ALLOWED[mime];
  const path = `payment-screenshots/${user.id}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("payment-screenshots")
    .upload(path, bytes, { contentType: mime, upsert: false });

  if (error) {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = createAdminClient();
    await admin.storage.createBucket("payment-screenshots", { public: false });
    const { error: retry } = await supabase.storage
      .from("payment-screenshots")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (retry) return NextResponse.json({ error: retry.message }, { status: 500 });
  }

  // Return a signed URL (60 min) so the screenshot is never publicly crawlable
  const { data: signed, error: signErr } = await supabase.storage
    .from("payment-screenshots")
    .createSignedUrl(path, 3600);

  if (signErr || !signed) {
    return NextResponse.json({ error: "Upload succeeded but URL generation failed" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl, path });
}
