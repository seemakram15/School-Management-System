import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, username, email, status, is_super_admin, created_at, user_roles(roles(name))")
    .is("deleted_at", null)
    .order("name");

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total users</p>
        </div>
        <Link href="/users/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add User</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name", "email", "username"]}
          columns={[
            { key: "name", label: "Name" },
            { key: "username", label: "Username" },
            { key: "email", label: "Email" },
            { key: "user_roles", label: "Role" },
            { key: "is_super_admin", label: "Super Admin" },
            { key: "created_at", label: "Created" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => {
            const roles = (r as unknown as { user_roles: Array<{ roles: { name: string } | null }> }).user_roles;
            return {
              name: r.name,
              username: r.username,
              email: r.email,
              user_roles: roles?.map(ur => ur.roles?.name).filter(Boolean).join(", ") || "—",
              is_super_admin: r.is_super_admin ? <Badge variant="info">Yes</Badge> : "—",
              created_at: formatDate(r.created_at),
              status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
            };
          })}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/users/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
