"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Clock, CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp,
  Phone, Building2, CreditCard, Image, Loader2, RefreshCw
} from "lucide-react";

type Request = {
  id: string;
  status: "pending" | "approved" | "rejected";
  payment_method: "jazzcash" | "meezan";
  transaction_id: string;
  screenshot_url: string;
  admin_notes: string | null;
  created_at: string;
  schools: { name: string; email: string | null; phone: string | null; slug: string } | null;
  plans: { name: string; price_pkr: number } | null;
};

const STATUS = {
  pending:  { icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Pending" },
  approved: { icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   label: "Approved" },
  rejected: { icon: XCircle,      color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       label: "Rejected" },
};

export default function RequestsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [imageModal, setImageModal] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const query = supabase
      .from("subscriptions")
      .select(`id, status, payment_method, transaction_id, screenshot_url, admin_notes, created_at, schools(name, email, phone, slug), plans(name, price_pkr)`)
      .order("created_at", { ascending: false });

    if (filter !== "all") query.eq("status", filter);
    const { data } = await query;
    setRequests((data ?? []) as unknown as Request[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionLoading(id + action);
    const res = await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNotes: notes[id] || null }),
    });
    if (res.ok) {
      await load();
      setExpanded(null);
    }
    setActionLoading(null);
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Subscription Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Review payment submissions and approve or reject them</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pending", "all", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-lg">No {filter !== "all" ? filter : ""} requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const cfg = STATUS[req.status];
            const isExpanded = expanded === req.id;

            return (
              <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : req.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-white">{req.schools?.name ?? "—"}</p>
                      <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {req.plans?.name} plan · Rs. {req.plans?.price_pkr?.toLocaleString()}/mo ·{" "}
                      {req.payment_method === "jazzcash" ? "JazzCash" : "Meezan Bank"} ·{" "}
                      {formatDate(req.created_at)}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-800 px-6 py-6 space-y-5">
                    {/* School info */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">School</p>
                        <p className="font-semibold text-white text-sm">{req.schools?.name}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{req.schools?.email ?? "—"}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          {req.payment_method === "jazzcash" ? <Phone className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                          Payment Method
                        </p>
                        <p className="font-semibold text-white text-sm capitalize">{req.payment_method === "jazzcash" ? "JazzCash" : "Meezan Bank"}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Transaction ID</p>
                        <p className="font-mono font-semibold text-white text-sm">{req.transaction_id}</p>
                      </div>
                    </div>

                    {/* Screenshot */}
                    <div>
                      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Image className="w-3 h-3" /> Payment Screenshot</p>
                      <div
                        className="relative rounded-xl overflow-hidden border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors max-w-sm"
                        onClick={() => setImageModal(req.screenshot_url)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={req.screenshot_url} alt="Payment screenshot" className="w-full max-h-48 object-contain bg-slate-800" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                          <span className="text-white text-sm font-medium">Click to enlarge</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin notes */}
                    {req.status === "pending" && (
                      <div>
                        <label className="text-xs text-slate-500 mb-2 block">Admin Notes (optional — shown to school owner on rejection)</label>
                        <textarea
                          value={notes[req.id] ?? ""}
                          onChange={e => setNotes(n => ({ ...n, [req.id]: e.target.value }))}
                          rows={2}
                          placeholder="e.g. Screenshot unclear, please re-upload…"
                          className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        />
                      </div>
                    )}

                    {req.admin_notes && req.status !== "pending" && (
                      <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">Admin Notes</p>
                        <p className="text-slate-300 text-sm">{req.admin_notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {req.status === "pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(req.id, "approve")}
                          disabled={actionLoading !== null}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm active:scale-95 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === req.id + "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Approve & Activate
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "reject")}
                          disabled={actionLoading !== null}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-600/30 text-red-400 hover:text-white font-bold text-sm active:scale-95 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === req.id + "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image modal */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <div className="max-w-2xl w-full rounded-2xl overflow-hidden border border-slate-700" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageModal} alt="Payment screenshot" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
