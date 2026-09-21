import { createAdminClient } from "@/lib/supabase/server";

export type NotificationType =
  | "fee_paid"
  | "fee_partial"
  | "fee_overdue"
  | "student_enrolled"
  | "student_promoted"
  | "invoice_generated"
  | "exam_scheduled"
  | "leave_approved"
  | "leave_rejected";

interface CreateNotificationOptions {
  type: NotificationType;
  notifiable_id: string;       // user/owner id who receives it
  notifiable_type?: string;    // "user" by default
  school_id?: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
}

export async function createNotification(opts: CreateNotificationOptions) {
  try {
    const supabase = createAdminClient();
    await supabase.from("notifications").insert({
      type: opts.type,
      notifiable_type: opts.notifiable_type ?? "user",
      notifiable_id: opts.notifiable_id,
      school_id: opts.school_id ?? null,
      data: { message: opts.message, link: opts.link ?? null, ...opts.meta },
    });
  } catch {
    // Non-critical — never fail the main request
  }
}

export async function getSchoolOwner(school_id: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("schools")
      .select("owner_id")
      .eq("id", school_id)
      .single();
    return data?.owner_id ?? null;
  } catch {
    return null;
  }
}
