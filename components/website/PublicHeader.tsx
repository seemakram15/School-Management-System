"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Class Profiles", href: "/class" },
  { label: "Teachers", href: "/teachers-profile" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Timeline", href: "/timeline" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact-us" },
];

export function PublicHeader({ instituteName }: { instituteName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          {instituteName}
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition">
            Login
          </Link>
        </nav>

        <button className="lg:hidden p-2 rounded-md hover:bg-muted transition" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border px-4 py-3 space-y-1 bg-card">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition">
              {item.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="block px-2 py-2 rounded-md text-sm font-semibold text-primary">
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}
