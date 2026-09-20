import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function FeeReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; report?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date();
  const report = sp.report ?? "collection";
  const from = sp.from ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const to = sp.to ?? today.toISOString().slice(0, 10);

  let collectionData: any[] = [];
  let defaulterData: any[] = [];

  if (report === "collection") {
    const { data } = await supabase
      .from("fee_payments")
      .select("amount, payment_date, payment_method, fee_invoices(invoice_no, fee_types(name), registrations(students(name), i_classes(name)))")
      .gte("payment_date", from)
      .lte("payment_date", to)
      .order("payment_date", { ascending: false });
    collectionData = data ?? [];
  } else {
    const { data } = await supabase
      .from("fee_invoices")
      .select("id, invoice_no, month, year, net_amount, due_date, status, fee_types(name), registrations(students(name, phone_no, father_name), i_classes(name))")
      .lt("due_date", today.toISOString().slice(0, 10))
      .in("status", ["unpaid", "partial"])
      .order("due_date");
    defaulterData = data ?? [];
  }

  const totalCollection = collectionData.reduce((s, p) => s + Number(p.amount), 0);
  const totalDefaulter = defaulterData.reduce((s, i) => s + Number(i.net_amount), 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Fee Reports</h2>
        <p className="text-sm text-muted-foreground">Collection summary and defaulters list</p>
      </div>

      <form method="GET" className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Report Type</label>
            <select name="report" defaultValue={report} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
              <option value="collection">Collection Report</option>
              <option value="defaulters">Defaulters List</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">From Date</label>
            <input name="from" type="date" defaultValue={from} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">To Date</label>
            <input name="to" type="date" defaultValue={to} className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">Generate</button>
        </div>
      </form>

      {report === "collection" ? (
        <div className="space-y-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 flex justify-between items-center">
            <p className="text-sm font-medium text-green-400">Total Collected ({from} to {to})</p>
            <p className="text-xl font-bold text-green-400">PKR {totalCollection.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border"><tr>
                {["Date","Student","Class","Fee Type","Amount","Method"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {collectionData.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No collections in this period</td></tr>
                ) : collectionData.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{p.payment_date}</td>
                    <td className="px-4 py-3 font-medium">{p.fee_invoices?.registrations?.students?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.fee_invoices?.registrations?.i_classes?.name}</td>
                    <td className="px-4 py-3">{p.fee_invoices?.fee_types?.name}</td>
                    <td className="px-4 py-3 font-mono text-green-400">PKR {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.payment_method?.replace("_"," ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex justify-between items-center">
            <p className="text-sm font-medium text-red-400">Total Outstanding (Overdue)</p>
            <p className="text-xl font-bold text-red-400">PKR {totalDefaulter.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border"><tr>
                {["Student","Class","Fee Type","Period","Amount","Due Date","Status",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {defaulterData.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No overdue invoices</td></tr>
                ) : defaulterData.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{inv.registrations?.students?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.registrations?.i_classes?.name}</td>
                    <td className="px-4 py-3">{inv.fee_types?.name}</td>
                    <td className="px-4 py-3">{inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                    <td className="px-4 py-3 font-mono text-red-400">PKR {Number(inv.net_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.due_date}</td>
                    <td className="px-4 py-3"><Badge variant="destructive" className="capitalize">{inv.status}</Badge></td>
                    <td className="px-4 py-3">
                      <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">Collect →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
