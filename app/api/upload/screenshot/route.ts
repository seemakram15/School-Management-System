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
  // Auth check uses user client; all storage ops use admin to bypass RLS
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
  const storagePath = `payment-screenshots/${user.id}-${Date.now()}.${ext}`;

  const { createAdminClient } = await import("@/lib/supabase/server");
  const admin = createAdminClient();

  // Ensure bucket exists
  await admin.storage.createBucket("payment-screenshots", { public: false }).catch(() => {});

  const { error: uploadError } = await admin.storage
    .from("payment-screenshots")
    .upload(storagePath, bytes, { contentType: mime, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Signed URL valid for 1 hour — enough for the submission flow
  const { data: signed, error: signErr } = await admin.storage
    .from("payment-screenshots")
    .createSignedUrl(storagePath, 3600);

  if (signErr || !signed) {
    return NextResponse.json({ error: "Upload succeeded but URL generation failed" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl, path: storagePath });
}
