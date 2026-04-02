import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function FaqPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, order, status")
    .order("order", { ascending: true });

  type FaqRow = { id: number; question: string; answer: string; order: number | null; status: number | null };
  const rows = (data ?? []) as FaqRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">FAQs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} total FAQs</p>
        </div>
        <Link href="/site/faq/new">
          <Button size="sm"><Plus className="w-3.5 h-3.5" />Add FAQ</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <DataTable
          data={rows}
          searchKeys={["question"]}
          columns={[
            { key: "order", label: "#" },
            { key: "question", label: "Question" },
            { key: "answer", label: "Answer" },
            { key: "status", label: "Status" },
          ]}
          rows={rows.map(r => ({
            order: r.order ?? "-",
            question: r.question,
            answer: r.answer.length > 80 ? r.answer.slice(0, 80) + "…" : r.answer,
            status: <Badge variant={r.status === 1 ? "success" : "danger"}>{r.status === 1 ? "Active" : "Inactive"}</Badge>,
          }))}
          rowActions={rows.map(row => (
            <Link key={row.id} href={`/site/faq/${row.id}/edit`}>
              <button className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
            </Link>
          ))}
        />
      </div>
    </div>
  );
}
