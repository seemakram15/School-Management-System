import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DollarSign, AlertCircle, Clock, TrendingUp } from "lucide-react";

export default async function FeeDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [invoicesResult, paymentsResult, recentResult] = await Promise.all([
    supabase.from("fee_invoices").select("net_amount, status, due_date"),
    supabase.from("fee_payments").select("amount"),
    supabase.from("fee_payments")
      .select("amount, payment_date, payment_method, fee_invoices(invoice_no, fee_types(name), registrations(students(name), i_classes(name)))")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const invoices = (invoicesResult.data ?? []) as { net_amount: number; status: string; due_date: string }[];
  const total_collected = (paymentsResult.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const total_pending = invoices
    .filter(i => i.status === "unpaid" || i.status === "partial")
    .reduce((s, i) => s + Number(i.net_amount), 0);
  const total_overdue = invoices
    .filter(i => (i.status === "unpaid" || i.status === "partial") && i.due_date < today)
    .reduce((s, i) => s + Number(i.net_amount), 0);

  const cards = [
    { label: "Total Collected", value: `PKR ${total_collected.toLocaleString()}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Pending", value: `PKR ${total_pending.toLocaleString()}`, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Total Overdue", value: `PKR ${total_overdue.toLocaleString()}`, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Total Invoices", value: invoices.length.toLocaleString(), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  const quickActions = [
    { label: "Collect Fee", href: "/fees/collect" },
    { label: "Generate Invoices", href: "/fees/invoices/generate" },
    { label: "All Invoices", href: "/fees/invoices" },
    { label: "Overdue Invoices", href: "/fees/invoices?status=unpaid" },
    { label: "Fee Types", href: "/fees/types" },
    { label: "Fee Structures", href: "/fees/structures" },
    { label: "Reports", href: "/fees/reports" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Fee Management</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of fee collection and outstanding dues.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-sm">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.bg}`}>
              <c.icon className={`w-6 h-6 ${c.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Recent Payments</h3>
            <Link href="/fees/invoices" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {(recentResult.data ?? []).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No payments recorded yet</p>
            ) : (recentResult.data ?? []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{(p.fee_invoices as any)?.registrations?.students?.name}</p>
                  <p className="text-xs text-muted-foreground">{(p.fee_invoices as any)?.fee_types?.name} · {p.payment_date}</p>
                </div>
                <p className="text-sm font-bold text-green-400">PKR {Number(p.amount).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
            {quickActions.map(a => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition text-sm font-medium text-foreground hover:text-primary">
                <DollarSign className="w-4 h-4 text-primary shrink-0" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
