"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Facebook, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  instituteName: string;
  address: string;
  phone: string;
  email: string;
  social: { facebook: string; twitter: string; youtube: string; linkedin: string };
}

export function PublicFooter({ instituteName, address, phone, email, social }: FooterProps) {
  const [subEmail, setSubEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/site/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Subscribed! Thanks for joining our newsletter.");
      setSubEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { href: social.facebook, icon: Facebook },
    { href: social.twitter, icon: Twitter },
    { href: social.youtube, icon: Youtube },
    { href: social.linkedin, icon: Linkedin },
  ].filter(s => s.href);

  return (
    <footer className="bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">{instituteName}</h3>
          <p className="text-sm text-white/60">Nurturing minds, building futures.</p>
          {socialLinks.length > 0 && (
            <div className="flex gap-3 pt-1">
              {socialLinks.map(({ href, icon: Icon }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm text-white/70">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Contact</h4>
          {address && <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{address}</p>}
          {phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />{phone}</p>}
          {email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" />{email}</p>}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Newsletter</h4>
          <p className="text-sm text-white/60">Get updates on events and announcements.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email" required value={subEmail} onChange={e => setSubEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {instituteName}. All rights reserved. ·{" "}
        <Link href="/login" className="hover:text-white transition">Staff Login</Link>
      </div>
    </footer>
  );
}
