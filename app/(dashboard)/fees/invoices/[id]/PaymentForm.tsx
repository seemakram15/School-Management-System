"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentForm({ invoiceId, balance }: { invoiceId: number; balance: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/fees/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: invoiceId,
        amount: fd.get("amount"),
        payment_method: fd.get("payment_method"),
        payment_date: fd.get("payment_date"),
        reference_no: fd.get("reference_no"),
        note: fd.get("note"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-sm mb-4 text-foreground">Collect Payment</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Amount (PKR) *</label>
            <input name="amount" type="number" min="1" step="0.01" defaultValue={balance > 0 ? balance : ""} required
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
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Recording…" : "Record Payment"}</Button>
      </form>
    </div>
  );
}
