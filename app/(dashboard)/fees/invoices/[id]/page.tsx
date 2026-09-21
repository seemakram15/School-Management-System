import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import PaymentForm from "./PaymentForm";

const STATUS_VARIANTS: Record<string, "default" | "danger" | "warning" | "success" | "info"> = {
  unpaid: "danger", partial: "warning", paid: "success", waived: "info",
};
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, amount, discount, fine, net_amount,
      due_date, status, note, created_at,
      fee_types(name),
      registrations(id, roll_no, students(id, name, phone_no, father_name), i_classes(name), sections(name)),
      fee_payments(id, amount, payment_date, payment_method, reference_no, note, created_at)
    `)
    .eq("id", parseInt(id))
    .single();

  if (!inv) redirect("/fees/invoices");

  const totalPaid = (inv.fee_payments as any[]).reduce((s: number, p: any) => s + Number(p.amount), 0);
  const balance = Number(inv.net_amount) - totalPaid;
  const student = (inv.registrations as any)?.students;
  const cls = (inv.registrations as any)?.i_classes;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Invoice #{inv.invoice_no}</h2>
          <p className="text-sm text-muted-foreground">{student?.name} — {cls?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[inv.status] ?? "default"} className="capitalize text-sm px-3 py-1">{inv.status}</Badge>
          <Link href={`/fees/students/${student?.id}`} className="text-xs text-primary hover:underline">Full History →</Link>
        </div>
      </div>

      {/* Invoice details grid */}
      <div className="bg-card rounded-xl border border-border p-5 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {[
            ["Fee Type", (inv.fee_types as any)?.name],
            ["Period", inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`],
            ["Due Date", inv.due_date],
            ["Student Phone", student?.phone_no || "—"],
            ["Father/Guardian", student?.father_name || "—"],
            ["Roll No.", (inv.registrations as any)?.roll_no || "—"],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Base Amount</span><span className="font-mono">PKR {Number(inv.amount).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="font-mono text-green-400">- PKR {Number(inv.discount).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Fine</span><span className="font-mono text-red-400">+ PKR {Number(inv.fine).toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold"><span>Net Amount</span><span className="font-mono">PKR {Number(inv.net_amount).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total Paid</span><span className="font-mono text-green-400">PKR {totalPaid.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold"><span className={balance > 0 ? "text-red-400" : "text-green-400"}>Balance Due</span><span className={`font-mono ${balance > 0 ? "text-red-400" : "text-green-400"}`}>PKR {balance.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Payment history */}
      {(inv.fee_payments as any[]).length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
          <div className="px-5 py-3 border-b border-border font-semibold text-sm text-foreground">Payment History</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              {["Date","Amount","Method","Reference","Note"].map(h => <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {(inv.fee_payments as any[]).map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-2">{p.payment_date}</td>
                  <td className="px-4 py-2 font-mono text-green-400">PKR {Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{p.payment_method?.replace("_", " ")}</td>
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{p.reference_no || "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Collect payment — only if not fully settled */}
      {inv.status !== "paid" && inv.status !== "waived" && (
        <PaymentForm invoiceId={inv.id} balance={balance} />
      )}
    </div>
  );
}
