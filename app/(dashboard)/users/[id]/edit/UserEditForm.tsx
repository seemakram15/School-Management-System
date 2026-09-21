"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/lib/utils";

interface Role { id: number; name: string; }
interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  phone_no: string | null;
  status: number | null;
  force_logout: boolean | null;
  user_roles: Array<{ role_id: number }>;
}

export default function UserEditForm({ user }: { user: UserData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    phone_no: user.phone_no ?? "",
    status: String(user.status ?? 1),
    force_logout: !!user.force_logout,
    role_id: String(user.user_roles?.[0]?.role_id ?? ""),
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
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role_id: form.role_id ? parseInt(form.role_id) : undefined, status: parseInt(form.status) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("User updated");
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
        <p className="text-sm text-muted-foreground">Edit User</p>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name *">
            <Input value={form.name} onChange={set("name")} required maxLength={255} />
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
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-primary" checked={form.force_logout} onChange={e => setForm(f => ({ ...f, force_logout: e.target.checked }))} />
            Force Logout (invalidate current sessions)
          </label>
          <div className="flex gap-3 pt-2">
            <Link href="/users"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={loading} className="ml-auto">{loading ? "Saving..." : "Update User"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
