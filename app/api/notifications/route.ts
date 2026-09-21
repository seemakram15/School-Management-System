import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, data, read_at, created_at")
    .eq("notifiable_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const unread = (data ?? []).filter((n: { read_at: string | null }) => !n.read_at).length;
  return NextResponse.json({ notifications: data ?? [], unread });
}

// PATCH /api/notifications — mark all (or specific ids) as read
export async function PATCH(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const ids: string[] = body.ids ?? [];
  const now = new Date().toISOString();

  const supabase = createAdminClient();
  let query = supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("notifiable_id", user.id)
    .is("read_at", null);

  if (ids.length > 0) query = (query as any).in("id", ids);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
