import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Building2, ClipboardList, CheckCircle2, XCircle, Clock, TrendingUp, ArrowRight } from "lucide-react";

async function getStats() {
  const supabase = await createClient();
  const [total, pending, approved, rejected] = await Promise.all([
    supabase.from("schools").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "rejected"),
  ]);
  return {
    totalSchools: total.count ?? 0,
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
  };
}

async function getRecentRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(`
      id, status, payment_method, transaction_id, created_at,
      schools(name, email),
      plans(name, price_pkr)
    `)
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

const STATUS_CONFIG = {
  pending:  { icon: Clock,         color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20",  label: "Pending" },
  approved: { icon: CheckCircle2,  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",    label: "Approved" },
  rejected: { icon: XCircle,       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",        label: "Rejected" },
};

export default async function AdminDashboard() {
  const [stats, requests] = await Promise.all([getStats(), getRecentRequests()]);

  const cards = [
    { label: "Total Schools", value: stats.totalSchools, icon: Building2,      color: "bg-blue-500/20 text-blue-400",   border: "border-blue-500/20" },
    { label: "Pending Review", value: stats.pending,     icon: Clock,           color: "bg-yellow-500/20 text-yellow-400", border: "border-yellow-500/20" },
    { label: "Active Schools", value: stats.approved,    icon: CheckCircle2,    color: "bg-green-500/20 text-green-400",  border: "border-green-500/20" },
    { label: "Rejected",       value: stats.rejected,    icon: XCircle,         color: "bg-red-500/20 text-red-400",     border: "border-red-500/20" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of all schools and subscription requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(c => (
          <div key={c.label} className={`bg-slate-900 rounded-2xl border ${c.border} p-5`}>
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-white">{c.value}</p>
            <p className="text-slate-400 text-sm mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue estimate */}
      <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-blue-600/30 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Estimated Monthly Revenue</p>
          <p className="text-2xl font-extrabold text-white">
            Rs. {(stats.approved * 4000).toLocaleString()}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">Based on {stats.approved} approved subscriptions at avg Rs. 4,000</p>
        </div>
      </div>

      {/* Recent requests */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            Recent Requests
          </h2>
          <Link href="/admin/requests" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">No requests yet</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {requests.map((req: any) => {
              const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={req.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{req.schools?.name ?? "—"}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {req.plans?.name} plan · Rs. {req.plans?.price_pkr?.toLocaleString()}/mo · {req.payment_method === "jazzcash" ? "JazzCash" : "Meezan"}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>
                  {req.status === "pending" && (
                    <Link href="/admin/requests" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                      Review →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
