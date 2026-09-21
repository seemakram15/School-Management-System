"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";

interface MobileCardField {
  label: string;
  value: React.ReactNode;
}

interface MobileCardProps {
  title: React.ReactNode;
  fields: MobileCardField[];
  actions?: { label: string; onClick?: () => void; href?: string; icon?: React.ReactNode; danger?: boolean }[];
}

export function MobileCard({ title, fields, actions }: MobileCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-background rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <p className="font-semibold text-foreground text-sm">{title}</p>
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{f.label}</span>
              <span className="text-xs text-foreground flex-1 min-w-0">{f.value}</span>
            </div>
          ))}
        </div>
        {actions && actions.length > 0 && (
          <div className="relative shrink-0">
            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
            <button
              onClick={() => setOpen(v => !v)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
              <div className="absolute right-0 top-9 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-[130px]">
                {actions.map((a, i) =>
                  a.href ? (
                    <a key={i} href={a.href} onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors ${a.danger ? "text-destructive" : "text-foreground"}`}>
                      {a.icon && <span className="w-4 h-4">{a.icon}</span>}
                      {a.label}
                    </a>
                  ) : (
                    <button key={i} onClick={() => { setOpen(false); a.onClick?.(); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors ${a.danger ? "text-destructive" : "text-foreground"}`}>
                      {a.icon && <span className="w-4 h-4">{a.icon}</span>}
                      {a.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
