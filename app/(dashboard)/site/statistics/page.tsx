import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function StatisticsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("statistics")
    .select('id, label, value, icon, "order", status')
    .order("order");

  type StatRow = { id: number; label: string; value: string; icon: string | null; order: number | null; status: number | null };
  const rows = (data ?? []) as StatRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Statistics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total statistics</p>
        </div>
        <Link href="/site/statistics/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Statistic</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["label"]}
          columns={[
            { key: "order", label: "#" },
            { key: "icon", label: "Icon" },
            { key: "label", label: "Label" },
            { key: "value", label: "Value" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            order: r.order ?? "-",
            icon: r.icon ?? "-",
            label: r.label,
            value: r.value,
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/statistics/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
