import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Column<T> = {
  key: string;
  header: string;
  /** Value used for sorting and searching. */
  value?: (row: T) => string | number;
  cell?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  empty?: string;
  toolbar?: ReactNode;
};

/** Sortable, searchable, paginated table used across the admin panel. */
export function DataTable<T>({ rows, columns, rowKey, pageSize = 10, empty = "Nothing here yet.", toolbar }: Props<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const valueOf = (row: T, col: Column<T>) => (col.value ? col.value(row) : "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => columns.some((c) => String(valueOf(r, c)).toLowerCase().includes(q)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = valueOf(a, col);
      const bv = valueOf(b, col);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <TableHead key={c.key} className={c.className}>
                    {c.sortable === false || !c.value ? (
                      <span className="text-[11px] uppercase tracking-wider">{c.header}</span>
                    ) : (
                      <button
                        type="button"
                        className="flex items-center gap-1 text-[11px] uppercase tracking-wider hover:text-foreground"
                        onClick={() =>
                          setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 }))
                        }
                      >
                        {c.header}
                        {active && (sort!.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </button>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-xs text-muted-foreground">
                  {empty}
                </TableCell>
              </TableRow>
            ) : (
              slice.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={`text-xs ${c.className ?? ""}`}>
                      {c.cell ? c.cell(row) : String(valueOf(row, c))}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {sorted.length} row{sorted.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="size-7" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="tabular-nums">
            {current + 1} / {pages}
          </span>
          <Button size="icon" variant="ghost" className="size-7" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
