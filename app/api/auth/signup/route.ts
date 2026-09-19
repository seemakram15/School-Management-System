import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const { schoolName, ownerName, email, phone, password } = await req.json();

  if (!schoolName || !ownerName || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create account" }, { status: 400 });
  }

  const userId = authData.user.id;

  // Generate unique slug
  let slug = slugify(schoolName);
  const { count } = await admin.from("schools").select("id", { count: "exact", head: true }).like("slug", `${slug}%`);
  if ((count ?? 0) > 0) slug = `${slug}-${Date.now()}`;

  // Create school
  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({ name: schoolName, slug, owner_id: userId, email })
    .select("id")
    .single();

  if (schoolError || !school) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
  }

  // Create user profile
  const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "") + Date.now().toString().slice(-4);
  const { error: userError } = await admin.from("users").insert({
    id: userId,
    name: ownerName,
    username,
    email,
    phone_no: phone || null,
    is_super_admin: true,
    is_service_provider: false,
    school_id: school.id,
    status: 1,
    force_logout: false,
  });

  if (userError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true, schoolId: school.id });
}
