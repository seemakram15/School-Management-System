import { createClient } from "@/lib/supabase/server";
import { Bell, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("notifications")
    .select("id, type, data, read_at, created_at")
    .eq("notifiable_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(50);

  type NotifRow = { id: number; type: string; data: unknown; read_at: string | null; created_at: string };
  const rows = (data ?? []) as unknown as NotifRow[];
  const unread = rows.filter(r => !r.read_at).length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{unread} unread</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
            <Bell className="w-8 h-8 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          rows.map(n => {
            const parsed = typeof n.data === "string" ? JSON.parse(n.data) : n.data;
            return (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.read_at ? "bg-primary/5" : ""}`}>
                <div className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${!n.read_at ? "bg-primary/20" : "bg-muted"}`}>
                  {n.read_at ? <Check className="w-4 h-4 text-muted-foreground" /> : <Bell className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{parsed?.message ?? n.type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(n.created_at)}</p>
                </div>
                {!n.read_at && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
