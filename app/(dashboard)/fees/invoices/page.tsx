import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  unpaid: "destructive",
  partial: "secondary",
  paid: "default",
  waived: "outline",
};

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string; month?: string; year?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date();

  let query = supabase
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, net_amount, due_date, status,
      fee_types(name),
      registrations(students(name), i_classes(name))
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (sp.status) query = query.eq("status", sp.status);
  if (sp.month) query = query.eq("month", parseInt(sp.month));
  if (sp.year) query = query.eq("year", parseInt(sp.year));

  const { data: invoices } = await query;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Invoices</h2>
          <p className="text-sm text-muted-foreground">All student fee invoices</p>
        </div>
        <Link href="/fees/invoices/generate"><Button size="sm">Generate Invoices</Button></Link>
      </div>

      <form method="GET" className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Status</label>
            <select name="status" defaultValue={sp.status ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Statuses</option>
              {["unpaid","partial","paid","waived"].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Month</label>
            <select name="month" defaultValue={sp.month ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Months</option>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Year</label>
            <select name="year" defaultValue={sp.year ?? ""} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="">All Years</option>
              {[today.getFullYear(), today.getFullYear() - 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline">Filter</Button>
          <Link href="/fees/invoices"><Button size="sm" variant="ghost">Clear</Button></Link>
        </div>
      </form>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Invoice #","Student","Class","Fee Type","Period","Amount","Due Date","Status",""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(invoices ?? []).length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No invoices found</td></tr>
            ) : (invoices ?? []).map((inv: any) => (
              <tr key={inv.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.invoice_no}</td>
                <td className="px-4 py-3 font-medium">{inv.registrations?.students?.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.registrations?.i_classes?.name}</td>
                <td className="px-4 py-3">{inv.fee_types?.name}</td>
                <td className="px-4 py-3">{inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                <td className="px-4 py-3 font-mono">PKR {Number(inv.net_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.due_date}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANTS[inv.status] ?? "outline"} className="capitalize">{inv.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
