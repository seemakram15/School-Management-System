import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, username, email, phone_no, created_at, user_roles(roles(name))")
    .eq("id", authUser.id)
    .single();

  if (!profile) redirect("/login");

  const roles = (profile as unknown as { user_roles: Array<{ roles: { name: string } | null }> }).user_roles;
  const roleName = roles?.map(ur => ur.roles?.name).filter(Boolean).join(", ") || "—";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Account</h2>
        <p className="text-sm text-muted-foreground">View and update your profile</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{profile.name}</p>
          <p className="text-sm text-muted-foreground truncate">@{profile.username} · {profile.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Role: {roleName} · Member since {formatDate(profile.created_at)}</p>
        </div>
      </div>

      <ProfileEditForm name={profile.name} phone_no={profile.phone_no} />
    </div>
  );
}
