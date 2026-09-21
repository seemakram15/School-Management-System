import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
  const { schoolName, ownerName, email, phone, password } = await req.json();

  if (!schoolName || !ownerName || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Run auth creation and slug check in parallel — they don't depend on each other
  let slug = slugify(schoolName);
  const [authResult, slugResult] = await Promise.all([
    admin.auth.admin.createUser({ email, password, email_confirm: true }),
    admin.from("schools").select("id", { count: "exact", head: true }).like("slug", `${slug}%`),
  ]);

  const { data: authData, error: authError } = authResult;
  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create account" }, { status: 400 });
  }

  const userId = authData.user.id;
  if ((slugResult.count ?? 0) > 0) slug = `${slug}-${Date.now()}`;

  // Create user profile first (schools.owner_id FK references users.id)
  const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "") + Date.now().toString().slice(-4);
  const { error: userError } = await admin.from("users").insert({
    id: userId,
    name: ownerName,
    username,
    email,
    phone_no: phone || null,
    is_super_admin: true,
  });

  if (userError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: userError.message ?? "Failed to create user profile" }, { status: 500 });
  }

  // Now create school (FK to users.id is satisfied)
  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({ name: schoolName, slug, owner_id: userId, email })
    .select("id")
    .single();

  if (schoolError || !school) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: schoolError?.message ?? "Failed to create school" }, { status: 500 });
  }

  // Link user to their school
  await admin.from("users").update({ school_id: school.id }).eq("id", userId);

  return NextResponse.json({ success: true, schoolId: school.id });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected server error" }, { status: 500 });
  }
}
