"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (row: any) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: Column[];
  searchable?: boolean;
  searchKeys?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions?: (row: any) => React.ReactNode;
  emptyText?: string;
}

export function DataTable({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  actions,
  emptyText = "No records found.",
}: DataTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = searchable && search
    ? data.filter(row =>
        searchKeys.some(key => String(row[key] ?? "").toLowerCase().includes(search.toLowerCase()))
      )
    : data;

  const total = filtered.length;
  const pages = Math.ceil(total / pageSize);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {columns.map(col => (
                <th key={String(col.key)} className={cn("px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide", col.className)}>
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className={cn("px-4 py-3 text-foreground", col.className)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "-")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded hover:bg-muted disabled:opacity-40 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).filter(p => Math.abs(p - page) < 3).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={cn("w-7 h-7 rounded text-xs font-medium transition", p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-1.5 rounded hover:bg-muted disabled:opacity-40 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
