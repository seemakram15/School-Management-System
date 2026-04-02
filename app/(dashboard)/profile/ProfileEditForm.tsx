"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ProfileEditForm({ name, phone_no }: { name: string; phone_no: string | null }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name, phone_no: phone_no ?? "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone_no: form.phone_no }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (form.password) {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: form.password });
        if (error) throw new Error(error.message);
      }

      toast.success("Profile updated");
      setForm(f => ({ ...f, password: "" }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name *">
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required maxLength={255} />
        </FormField>
        <FormField label="Phone No.">
          <Input value={form.phone_no} onChange={e => setForm(f => ({ ...f, phone_no: e.target.value }))} maxLength={15} />
        </FormField>
        <FormField label="New Password">
          <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current password" minLength={6} />
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
