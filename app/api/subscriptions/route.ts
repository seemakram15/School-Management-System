import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // User client for auth only; admin client for all DB reads/writes (bypasses RLS)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId, paymentMethod, transactionId, screenshotUrl } = await req.json();

  if (!planId || !paymentMethod || !transactionId || !screenshotUrl) {
    return NextResponse.json({ error: "All payment details required" }, { status: 400 });
  }

  // Validate screenshotUrl is a Supabase storage URL owned by this user.
  const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
  const urlObj = (() => { try { return new URL(screenshotUrl); } catch { return null; } })();
  const validPath =
    urlObj &&
    urlObj.host === supabaseHost &&
    !urlObj.pathname.includes("..") &&
    urlObj.pathname.includes(`/payment-screenshots/${user.id}-`);
  if (!validPath) {
    return NextResponse.json({ error: "Invalid screenshot URL" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get school owned by this user
  const { data: school } = await admin
    .from("schools")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

  // Check if already has a pending/approved subscription
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, status")
    .eq("school_id", school.id)
    .in("status", ["pending", "approved"])
    .single();

  const { data: sub, error } = await admin
    .from("subscriptions")
    .insert({
      school_id: school.id,
      plan_id: planId,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      screenshot_url: screenshotUrl,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, subscriptionId: sub.id });
}
