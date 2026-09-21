"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function CollectFeePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Payment modal
  const [payInvoice, setPayInvoice] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch("/api/students?status=1");
    const data = await res.json();
    setSearching(false);
    const q = query.toLowerCase();
    setResults((data ?? []).filter((r: any) =>
      r.students?.name?.toLowerCase().includes(q) ||
      String(r.roll_no ?? "").includes(q)
    ).slice(0, 10));
  }

  async function selectStudent(reg: any) {
    setSelected(reg);
    setResults([]);
    setQuery("");
    setLoadingInvoices(true);
    const [res, partial] = await Promise.all([
      fetch(`/api/fees/invoices?registration_id=${reg.id}&status=unpaid&limit=50`),
      fetch(`/api/fees/invoices?registration_id=${reg.id}&status=partial&limit=50`),
    ]);
    const [d1, d2] = await Promise.all([res.json(), partial.json()]);
    setLoadingInvoices(false);
    setInvoices([...(d1 ?? []), ...(d2 ?? [])]);
  }

  async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!payInvoice) return;
    setPaying(true); setPayError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: payInvoice.id,
        amount: fd.get("amount"),
        payment_method: fd.get("payment_method"),
        payment_date: fd.get("payment_date"),
        reference_no: fd.get("reference_no"),
        note: fd.get("note"),
      }),
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) { setPayError(data.error); return; }
    // Update local invoice list
    if (data.status === "paid") {
      setInvoices(prev => prev.filter(i => i.id !== payInvoice.id));
    } else {
      setInvoices(prev => prev.map(i => i.id === payInvoice.id ? { ...i, status: data.status } : i));
    }
    setPayInvoice(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Collect Fee</h2>
        <p className="text-sm text-muted-foreground">Search a student to view and collect outstanding dues</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Search by student name or roll number…"
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" onClick={search} disabled={searching}>{searching ? "…" : "Search"}</Button>
        </div>
        {results.length > 0 && (
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {results.map((s: any) => (
              <button key={s.id} onClick={() => selectStudent(s)}
                className="w-full text-left px-4 py-2.5 hover:bg-muted/50 text-sm flex justify-between items-center transition">
                <span className="font-medium text-foreground">{s.students?.name}</span>
                <span className="text-muted-foreground text-xs">{s.i_classes?.name} · Roll {s.roll_no}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{selected.students?.name}</p>
              <p className="text-xs text-muted-foreground">{selected.i_classes?.name} · Section {selected.sections?.name} · Roll {selected.roll_no}</p>
            </div>
            <Link href={`/fees/students/${selected.students?.id}`} className="text-xs text-primary hover:underline">Full History →</Link>
          </div>

          {loadingInvoices ? (
            <p className="text-sm text-muted-foreground py-4">Loading invoices…</p>
          ) : invoices.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No outstanding dues for this student.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border"><tr>
                  {["Fee Type","Period","Amount","Status",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">{inv.fee_types?.name}</td>
                      <td className="px-4 py-3">{inv.month ? `${MONTHS[inv.month]} ${inv.year}` : `${inv.year}`}</td>
                      <td className="px-4 py-3 font-mono">PKR {Number(inv.net_amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant={inv.status === "partial" ? "warning" : "danger"} className="capitalize">{inv.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setPayError(""); setPayInvoice(inv); }}
                          className="text-primary text-xs hover:underline font-medium"
                        >
                          Collect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <Dialog open={!!payInvoice} onOpenChange={v => { if (!v) setPayInvoice(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          {payInvoice && (
            <form onSubmit={handlePayment} className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3 py-2.5 border border-border">
                <span className="text-muted-foreground">{payInvoice.fee_types?.name} · {payInvoice.month ? `${MONTHS[payInvoice.month]} ${payInvoice.year}` : payInvoice.year}</span>
                <span className="font-mono font-semibold">PKR {Number(payInvoice.net_amount).toLocaleString()}</span>
              </div>
              {payError && <p className="text-sm text-destructive">{payError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Amount (PKR) *</label>
                  <input name="amount" type="number" min="1" step="0.01" required
                    defaultValue={Number(payInvoice.net_amount)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Method</label>
                  <select name="payment_method" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Date</label>
                  <input name="payment_date" type="date" defaultValue={new Date().toISOString().slice(0,10)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Reference No.</label>
                  <input name="reference_no" placeholder="Cheque / Txn no."
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Note</label>
                <input name="note" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" disabled={paying} className="flex-1">{paying ? "Recording…" : "Record Payment"}</Button>
                <Button type="button" variant="outline" onClick={() => setPayInvoice(null)}>Cancel</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
