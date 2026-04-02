import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function SlidersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sliders")
    .select("id, title, sub_title, image, status")
    .order("id", { ascending: false });

  type SliderRow = { id: number; title: string; sub_title: string | null; image: string | null; status: number | null };
  const rows = (data ?? []) as SliderRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sliders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total sliders</p>
        </div>
        <Link href="/site/sliders/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Slider</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["title"]}
          columns={[
            { key: "title", label: "Title" },
            { key: "sub_title", label: "Sub Title" },
            { key: "image", label: "Image" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            title: r.title,
            sub_title: r.sub_title ?? "-",
            image: r.image ?? "-",
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/sliders/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
