"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  data: unknown;
  read_at: string | null;
  created_at: string;
};

const TYPE_ICON: Record<string, string> = {
  fee_paid: "💰",
  fee_partial: "💵",
  fee_overdue: "⚠️",
  student_enrolled: "🎓",
  student_promoted: "⬆️",
  invoice_generated: "📄",
  exam_scheduled: "📝",
  leave_approved: "✅",
  leave_rejected: "❌",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Refresh unread count every 60s
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications(n => n.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
    setUnread(0);
  }

  function toggle() {
    if (!open) load();
    setOpen(v => !v);
  }

  const parsed = notifications.map(n => ({
    ...n,
    parsed: typeof n.data === "string" ? JSON.parse(n.data) : (n.data as Record<string, unknown>),
  }));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2 rounded-xl hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-destructive text-white text-[9px] font-bold px-0.5 border-2 border-card">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unread > 0 && (
                <span className="bg-destructive/15 text-destructive text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg hover:bg-primary/10">
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading…</div>
            ) : parsed.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
                <Bell className="w-7 h-7 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : parsed.map(n => {
              const msg = n.parsed?.message as string ?? n.type;
              const link = n.parsed?.link as string | undefined;
              const icon = TYPE_ICON[n.type] ?? "🔔";
              const isUnread = !n.read_at;

              const inner = (
                <div className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${isUnread ? "bg-primary/5" : ""}`}>
                  <div className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-base ${isUnread ? "bg-primary/15" : "bg-muted"}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${isUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>{msg}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(n.created_at)}</p>
                  </div>
                  {isUnread && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  {!isUnread && <Check className="w-3.5 h-3.5 text-muted-foreground/40 mt-1 shrink-0" />}
                </div>
              );

              return link ? (
                <Link key={n.id} href={link} onClick={() => setOpen(false)}>{inner}</Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/20">
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-primary hover:underline">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
