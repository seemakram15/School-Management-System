"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Subject { id: number; name: string; }
interface Profile { about: string | null; facebook: string | null; twitter: string | null; linkedin: string | null; subject_id: number | null; }

export default function PublicProfileForm({ employeeId, profile }: { employeeId: number; profile: Profile | null }) {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState({
    about: profile?.about ?? "",
    facebook: profile?.facebook ?? "",
    twitter: profile?.twitter ?? "",
    linkedin: profile?.linkedin ?? "",
    subject_id: String(profile?.subject_id ?? ""),
  });

  useEffect(() => {
    fetch("/api/academic/subjects").then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/teacher-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Public profile updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Subject" className="max-w-sm">
        <Select value={form.subject_id} onChange={set("subject_id")}>
          <option value="">None</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </FormField>
      <FormField label="About">
        <Textarea value={form.about} onChange={set("about")} rows={4} maxLength={1000} placeholder="Short bio shown on the public website" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Facebook URL">
          <Input value={form.facebook} onChange={set("facebook")} placeholder="https://facebook.com/..." type="url" />
        </FormField>
        <FormField label="Twitter URL">
          <Input value={form.twitter} onChange={set("twitter")} placeholder="https://twitter.com/..." type="url" />
        </FormField>
        <FormField label="LinkedIn URL">
          <Input value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/..." type="url" />
        </FormField>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Public Profile"}</Button>
    </form>
  );
}
