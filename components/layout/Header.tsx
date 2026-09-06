"use client";

import { Bell, Menu, Search, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-3.5 bg-card border-b border-border shadow-sm">
      {/* Mobile menu toggle — wired up by parent if needed */}
      <button className="lg:hidden p-1.5 rounded-md hover:bg-muted transition">
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">/</span>}
                {b.href ? (
                  <Link href={b.href} className="hover:text-foreground transition">{b.label}</Link>
                ) : (
                  <span className="text-foreground font-medium">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-muted transition text-muted-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">Account</span>
        </Link>
      </div>
    </header>
  );
}
