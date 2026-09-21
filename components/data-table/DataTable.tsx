"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  rows?: Record<string, React.ReactNode>[];
  columns: Column[];
  searchable?: boolean;
  searchKeys?: string[];
  rowActions?: React.ReactNode[];
  emptyText?: string;
}

function KebabDropdown({ actions, open, onToggle, onClose }: {
  actions: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative shrink-0">
      {open && <div className="fixed inset-0 z-40" onClick={onClose} />}
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-9 z-50 bg-popover border border-border rounded-xl shadow-lg p-2 min-w-[120px]"
          onClick={onClose}
        >
          <div className="flex flex-col gap-1">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
}

export function DataTable({
  data,
  rows,
  columns,
  searchable = true,
  searchKeys = [],
  rowActions,
  emptyText = "No records found.",
}: DataTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const pageSize = 15;

  const allIndices = data.map((_, i) => i);
  const filteredIndices = searchable && search
    ? allIndices.filter(i =>
        searchKeys.some(key => String(data[i][key] ?? "").toLowerCase().includes(search.toLowerCase()))
      )
    : allIndices;

  const total = filteredIndices.length;
  const pages = Math.ceil(total / pageSize);
  const pageIndices = filteredIndices.slice((page - 1) * pageSize, page * pageSize);

  function cellValue(i: number, col: Column) {
    if (col.render) return col.render(data[i]);
    if (rows) return rows[i]?.[col.key];
    return String(data[i][col.key] ?? "-");
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {pageIndices.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">{emptyText}</div>
        ) : pageIndices.map(i => (
          <div key={i} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/60">
              <div className="min-w-0">
                <p className="text-xs font-mono text-muted-foreground leading-none mb-1">
                  {cellValue(i, columns[0])}
                </p>
                <p className="font-bold text-foreground text-base leading-tight">
                  {columns[1] ? cellValue(i, columns[1]) : "—"}
                </p>
              </div>
              {rowActions && (
                <KebabDropdown
                  actions={rowActions[i]}
                  open={openDropdown === i}
                  onToggle={() => setOpenDropdown(v => v === i ? null : i)}
                  onClose={() => setOpenDropdown(null)}
                />
              )}
            </div>
            {/* 2-column grid for remaining fields */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
              {columns.slice(2).map(col => (
                <div key={col.key} className="min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{col.label}</p>
                  <div className="text-sm text-foreground leading-snug">{cellValue(i, col)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {columns.map(col => (
                <th key={String(col.key)} className={cn("px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide", col.className)}>
                  {col.label}
                </th>
              ))}
              {rowActions && <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageIndices.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageIndices.map(i => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className={cn("px-4 py-3 text-foreground", col.className)}>
                      {cellValue(i, col)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3 text-right">
                      {rowActions[i]}
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
