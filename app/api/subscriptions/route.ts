import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId, paymentMethod, transactionId, screenshotUrl } = await req.json();

  if (!planId || !paymentMethod || !transactionId || !screenshotUrl) {
    return NextResponse.json({ error: "All payment details required" }, { status: 400 });
  }

  // Get school owned by this user
  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

  // Check if already has a pending/approved subscription
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("school_id", school.id)
    .in("status", ["pending", "approved"])
    .single();

  if (existing) {
    return NextResponse.json({ error: "Subscription already exists", status: existing.status }, { status: 409 });
  }

  const { data: sub, error } = await supabase
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
