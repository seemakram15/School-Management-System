import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select('id, title, description, icon, "order", status')
    .order("order");

  type ServiceRow = { id: number; title: string; description: string | null; icon: string | null; order: number | null; status: number | null };
  const rows = (data ?? []) as ServiceRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Services</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total services</p>
        </div>
        <Link href="/site/services/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Service</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["title"]}
          columns={[
            { key: "order", label: "#" },
            { key: "icon", label: "Icon" },
            { key: "title", label: "Title" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            order: r.order ?? "-",
            icon: r.icon ?? "-",
            title: r.title,
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/services/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
