import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, name, designation, message, photo, status")
    .order("id", { ascending: false });

  type TestimonialRow = { id: number; name: string; designation: string | null; message: string; photo: string | null; status: number | null };
  const rows = (data ?? []) as TestimonialRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Testimonials</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total testimonials</p>
        </div>
        <Link href="/site/testimonials/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add Testimonial</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["name"]}
          columns={[
            { key: "name", label: "Name" },
            { key: "designation", label: "Designation" },
            { key: "message", label: "Message" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            name: r.name,
            designation: r.designation ?? "-",
            message: r.message.length > 60 ? `${r.message.slice(0, 60)}...` : r.message,
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/testimonials/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
