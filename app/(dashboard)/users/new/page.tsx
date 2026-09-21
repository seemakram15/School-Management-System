"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/lib/utils";

interface Role { id: number; name: string; }

export default function UserNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({
    name: "", username: "", email: "", phone_no: "", password: "", role_id: "", status: "1",
  });

  useEffect(() => {
    fetch("/api/roles").then(r => r.json()).then(d => setRoles(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role_id: parseInt(form.role_id), status: parseInt(form.status) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("User created");
      router.push("/users");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">User</h2>
        <p className="text-sm text-muted-foreground">Add New User</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name *">
            <Input value={form.name} onChange={set("name")} placeholder="Full name" required maxLength={255} />
          </FormField>
          <FormField label="Username *">
            <Input value={form.username} onChange={set("username")} required maxLength={100} />
          </FormField>
          <FormField label="Email *">
            <Input type="email" value={form.email} onChange={set("email")} required maxLength={255} />
          </FormField>
          <FormField label="Phone No.">
            <Input value={form.phone_no} onChange={set("phone_no")} maxLength={15} />
          </FormField>
          <FormField label="Password *">
            <Input type="password" value={form.password} onChange={set("password")} placeholder="Temporary password" required minLength={6} />
          </FormField>
          <FormField label="Role *">
            <Select value={form.role_id} onChange={set("role_id")} required>
              <option value="">Pick a role...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={set("status")}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <Link href="/users"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Add User"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
