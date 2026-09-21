"use client";

import { Menu, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  onMenuClick?: () => void;
}

export function Header({ title, breadcrumbs, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 py-3 bg-card/80 border-b border-border backdrop-blur-xl backdrop-saturate-150 shadow-sm">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-border shrink-0" />}
                {b.href ? (
                  <Link href={b.href} className="text-muted-foreground hover:text-foreground transition-colors font-medium">{b.label}</Link>
                ) : (
                  <span className="text-foreground font-semibold">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-base font-bold text-foreground truncate">{title}</h1>
        ) : null}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <NotificationBell />

        {/* Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-all duration-200 group"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground hidden sm:block">Account</span>
        </Link>
      </div>
    </header>
  );
}
