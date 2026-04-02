"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Permission { id: number; name: string; slug: string; }
interface Role { id: number; name: string; deletable: boolean; }

export default function RoleEditForm({ role, initialSelected }: { role: Role; initialSelected: string[] }) {
  const router = useRouter();
  const readOnly = role.deletable === false;
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [name, setName] = useState(role.name);
  const [selected, setSelected] = useState<string[]>(initialSelected);

  useEffect(() => {
    fetch("/api/permissions").then(r => r.json()).then(d => setPermissions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const toggle = (slug: string) => {
    if (readOnly) return;
    setSelected(s => s.includes(slug) ? s.filter(x => x !== slug) : [...s, slug]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, permissions: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Role updated successfully");
      router.push("/roles");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Role</h2>
          <p className="text-sm text-muted-foreground">Edit Role</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/roles" className="hover:text-foreground">Roles</Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </nav>
      </div>

      {readOnly && (
        <div className="p-3 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm border border-yellow-200 dark:border-yellow-800">
          This is a system role (seeded with the app) and cannot be edited or deleted.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Role Info</h3>
          <FormField label="Role Name *" className="max-w-sm">
            <Input name="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Accountant" required minLength={2} maxLength={100} disabled={readOnly} />
          </FormField>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Permissions</h3>
          {permissions.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map(p => (
                <label key={p.id} className={`flex items-center gap-2 text-sm ${readOnly ? "opacity-60" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selected.includes(p.slug)}
                    onChange={() => toggle(p.slug)}
                    disabled={readOnly}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No permissions found</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/roles"><Button type="button" variant="outline">{readOnly ? "Back" : "Cancel"}</Button></Link>
          {!readOnly && (
            <Button type="submit" disabled={loading} className="ml-auto">
              {loading ? "Saving..." : "Update Role"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
