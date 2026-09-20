"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function CollectFeePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

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
    const res = await fetch(`/api/fees/invoices?registration_id=${reg.id}&status=unpaid&limit=50`);
    const partial = await fetch(`/api/fees/invoices?registration_id=${reg.id}&status=partial&limit=50`);
    const [d1, d2] = await Promise.all([res.json(), partial.json()]);
    setLoadingInvoices(false);
    setInvoices([...(d1 ?? []), ...(d2 ?? [])]);
  }

  return (
    <div className="space-y-5 max-w-2xl">
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
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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
                        <Link href={`/fees/invoices/${inv.id}`} className="text-primary text-xs hover:underline font-medium">Collect →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
