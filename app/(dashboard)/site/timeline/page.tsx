import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function TimelinePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("timeline_items")
    .select("id, year, title, description, order, status")
    .order("order", { ascending: true });

  type TimelineRow = { id: number; year: string; title: string; description: string | null; order: number | null; status: number | null };
  const rows = (data ?? []) as TimelineRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Timeline</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total items</p>
        </div>
        <Link href="/site/timeline/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Item</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["title", "year"]}
          columns={[
            { key: "order", label: "#" },
            { key: "year", label: "Year" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            order: r.order ?? "-",
            year: r.year,
            title: r.title,
            description: r.description ? (r.description.length > 60 ? r.description.slice(0, 60) + "…" : r.description) : "-",
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/timeline/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
