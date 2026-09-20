import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "default" | "danger" | "warning" | "success" | "info"> = {
  unpaid: "danger", partial: "warning", paid: "success", waived: "info",
};
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function StudentFeeHistoryPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, name, photo, father_name, phone_no")
    .eq("id", parseInt(studentId))
    .single();

  if (!student) redirect("/fees/collect");

  const { data: registration } = await supabase
    .from("registrations")
    .select("id, roll_no, i_classes(name), sections(name)")
    .eq("student_id", parseInt(studentId))
    .eq("status", 1)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: invoices } = registration ? await supabase
    .from("fee_invoices")
    .select("id, invoice_no, month, year, amount, discount, fine, net_amount, due_date, status, fee_types(name), fee_payments(amount)")
    .eq("registration_id", registration.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false }) : { data: [] };

  const totalBilled = (invoices ?? []).reduce((s: number, i: any) => s + Number(i.net_amount), 0);
  const totalPaid = (invoices ?? []).reduce((s: number, i: any) =>
    s + (i.fee_payments as any[]).reduce((ps: number, p: any) => ps + Number(p.amount), 0), 0);
  const totalDue = totalBilled - totalPaid;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
          <p className="text-sm text-muted-foreground">
            {(registration as any)?.i_classes?.name} · Section {(registration as any)?.sections?.name} · Roll {(registration as any)?.roll_no}
          </p>
          {student.father_name && <p className="text-xs text-muted-foreground">Father: {student.father_name}</p>}
        </div>
        <Link href="/fees/collect" className="text-xs text-primary hover:underline">← Back</Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Billed", value: totalBilled, color: "text-blue-400" },
          { label: "Total Paid", value: totalPaid, color: "text-green-400" },
          { label: "Balance Due", value: totalDue, color: totalDue > 0 ? "text-red-400" : "text-green-400" },
        ].map(card => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className={`text-xl font-bold ${card.color}`}>PKR {card.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border font-semibold text-sm text-foreground">All Invoices</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            {["Invoice #","Fee Type","Period","Billed","Paid","Status",""].map(h => (
              <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {(invoices ?? []).length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found</td></tr>
            ) : (invoices ?? []).map((inv: any) => {
              const paid = (inv.fee_payments as any[]).reduce((s: number, p: any) => s + Number(p.amount), 0);
              return (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{inv.invoice_no}</td>
                  <td className="px-4 py-2">{inv.fee_types?.name}</td>
                  <td className="px-4 py-2">{inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                  <td className="px-4 py-2 font-mono">PKR {Number(inv.net_amount).toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono text-green-400">PKR {paid.toLocaleString()}</td>
                  <td className="px-4 py-2"><Badge variant={STATUS_VARIANTS[inv.status] ?? "default"} className="capitalize">{inv.status}</Badge></td>
                  <td className="px-4 py-2">
                    <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline">View →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
