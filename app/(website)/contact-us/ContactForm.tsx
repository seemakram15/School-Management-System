"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/site/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Name *</label>
        <input
          required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Email *</label>
        <input
          type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Subject</label>
        <input
          value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Message *</label>
        <textarea
          required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
