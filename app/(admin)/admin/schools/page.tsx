import React from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Globe, Building2 } from "lucide-react";

async function getSchools() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select(`
      id, name, slug, email, phone, created_at, status,
      subscriptions(status, plans(name, price_pkr))
    `)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function SchoolsPage() {
  const schools = await getSchools();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">All Schools</h1>
        <p className="text-slate-400 text-sm mt-1">{schools.length} school{schools.length !== 1 ? "s" : ""} registered</p>
      </div>

      {schools.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No schools yet</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-4 text-left font-medium">School</th>
                <th className="px-6 py-4 text-left font-medium">Plan</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Registered</th>
                <th className="px-6 py-4 text-left font-medium">Site</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {schools.map((school: any) => {
                const sub = school.subscriptions?.[0];
                const subStatus = sub?.status ?? "none";

                const statusMap: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
                  approved: { icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   label: "Active" },
                  pending:  { icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Pending" },
                  rejected: { icon: XCircle,      color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       label: "Rejected" },
                  none:     { icon: Building2,    color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20",   label: "No Sub" },
                };
                const statusCfg = statusMap[subStatus] ?? { icon: Building2, color: "text-slate-400", bg: "bg-slate-700/20 border-slate-700", label: "Unknown" };

                return (
                  <tr key={school.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white text-sm">{school.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{school.email ?? "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      {sub?.plans ? (
                        <div>
                          <p className="text-white text-sm font-medium">{sub.plans.name}</p>
                          <p className="text-slate-500 text-xs">Rs. {sub.plans.price_pkr?.toLocaleString()}/mo</p>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(school.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/s/${school.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Visit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
