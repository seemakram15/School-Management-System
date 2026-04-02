import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Upsert teacher_profiles by employee_id (no unique constraint on employee_id in the
// schema, so we do update-if-exists / insert-if-not rather than a DB-level upsert).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const employeeId = parseInt(id);
  const body = await request.json();
  const { about, facebook, twitter, linkedin, subject_id } = body;

  const fields = {
    about: about || null,
    facebook: facebook || null,
    twitter: twitter || null,
    linkedin: linkedin || null,
    subject_id: subject_id ? parseInt(subject_id) : null,
  };

  const { data: existing } = await supabase
    .from("teacher_profiles")
    .select("id")
    .eq("employee_id", employeeId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("teacher_profiles").update(fields as never).eq("employee_id", employeeId)
    : await supabase.from("teacher_profiles").insert({ employee_id: employeeId, ...fields } as never);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
