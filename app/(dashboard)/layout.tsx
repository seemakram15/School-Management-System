import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/DashboardShell";

async function getSubscriptionStatus(userId: string): Promise<boolean> {
  return unstable_cache(
    async () => {
      const admin = createAdminClient();
      const { data: profile } = await admin.from("users").select("school_id").eq("id", userId).single();
      if (!profile?.school_id) return false;
      const { data: sub } = await admin
        .from("subscriptions")
        .select("status")
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return sub?.status === "pending";
    },
    [`sub-status-${userId}`],
    { revalidate: 60 }
  )();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isPending = await getSubscriptionStatus(user.id);

  return (
    <DashboardShell isPending={isPending}>
      {children}
    </DashboardShell>
  );
}
