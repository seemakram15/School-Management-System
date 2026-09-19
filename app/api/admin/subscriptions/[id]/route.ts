import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Must be service provider
  const { data: profile } = await supabase.from("users").select("is_service_provider").eq("id", user.id).single();
  if (!profile?.is_service_provider) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, adminNotes } = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      admin_notes: adminNotes ?? null,
      approved_at: action === "approve" ? new Date().toISOString() : null,
      approved_by: action === "approve" ? user.id : null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
