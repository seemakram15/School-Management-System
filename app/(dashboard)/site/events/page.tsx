import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, start_date, end_date, status")
    .order("start_date", { ascending: false });

  type EventRow = { id: number; title: string; start_date: string; end_date: string; status: number | null };
  const rows = (data ?? []) as EventRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Events</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total events</p>
        </div>
        <Link href="/site/events/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Event</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["title"]}
          columns={[
            { key: "title", label: "Title" },
            { key: "start_date", label: "Start Date" },
            { key: "end_date", label: "End Date" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            title: r.title,
            start_date: r.start_date,
            end_date: r.end_date,
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/events/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
