import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Columns3,
  Download,
  RefreshCw,
  Rows3,
  Search,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type Column<T> = {
  key: string;
  header: string;
  /** Value used for sorting, searching and CSV export. */
  value?: (row: T) => string | number;
  cell?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  /** Keep this column always visible in the column picker. */
  locked?: boolean;
};

/** A quick facet chip filter shown above the table. */
export type Facet<T> = {
  key: string;
  label: string;
  test: (row: T) => boolean;
};

export type BulkAction<T> = {
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  run: (rows: T[]) => void | Promise<void>;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  empty?: string;
  toolbar?: ReactNode;
  loading?: boolean;
  /** Enables checkbox selection + the bulk action bar. */
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  facets?: Facet<T>[];
  onRefresh?: () => void;
  /** File name (without extension) used by the CSV export button. */
  exportName?: string;
  onRowClick?: (row: T) => void;
};

function toCsv<T>(rows: T[], columns: Column<T>[]) {
  const cols = columns.filter((c) => c.value);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const head = cols.map((c) => esc(c.header)).join(",");
  const body = rows.map((r) => cols.map((c) => esc(c.value!(r))).join(",")).join("\n");
  return `${head}\n${body}`;
}

/** Pro data table: search, facets, sorting, selection, bulk actions, column picker, density, CSV export and pagination. */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  pageSize = 10,
  empty = "Nothing here yet.",
  toolbar,
  loading = false,
  selectable = false,
  bulkActions = [],
  facets = [],
  onRefresh,
  exportName = "export",
  onRowClick,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(pageSize);
  const [dense, setDense] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [activeFacets, setActiveFacets] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const visibleColumns = useMemo(() => columns.filter((c) => !hidden.includes(c.key)), [columns, hidden]);
  const valueOf = (row: T, col: Column<T>) => (col.value ? col.value(row) : "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (activeFacets.length) {
      const tests = facets.filter((f) => activeFacets.includes(f.key));
      out = out.filter((r) => tests.every((f) => f.test(r)));
    }
    if (q) out = out.filter((r) => columns.some((c) => String(valueOf(r, c)).toLowerCase().includes(q)));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns, query, activeFacets, facets]);

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

  const pages = Math.max(1, Math.ceil(sorted.length / size));
  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * size, current * size + size);

  useEffect(() => {
    setSelected((s) => s.filter((id) => rows.some((r) => rowKey(r) === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const pageIds = slice.map(rowKey);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const selectedRows = rows.filter((r) => selected.includes(rowKey(r)));
  const colSpan = visibleColumns.length + (selectable ? 1 : 0);

  const download = () => {
    const csv = toCsv(sorted, visibleColumns);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runBulk = async (action: BulkAction<T>) => {
    setBusy(true);
    try {
      await action.run(selectedRows);
      setSelected([]);
    } finally {
      setBusy(false);
    }
  };

  const cellPad = dense ? "py-1" : "py-2.5";

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
            placeholder="Search all columns…"
            className="h-8 pl-8 pr-8 text-xs"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setQuery("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {facets.map((f) => {
          const on = activeFacets.includes(f.key);
          return (
            <Button
              key={f.key}
              size="sm"
              variant={on ? "default" : "outline"}
              className="h-8 text-[11px]"
              onClick={() => {
                setPage(0);
                setActiveFacets((s) => (on ? s.filter((k) => k !== f.key) : [...s, f.key]));
              }}
            >
              {f.label}
            </Button>
          );
        })}

        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" className="size-8" onClick={onRefresh} aria-label="Refresh data">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="size-8" onClick={() => setDense((d) => !d)} aria-label="Toggle row density">
              {dense ? <Rows3 className="h-3.5 w-3.5" /> : <ChevronsUpDown className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{dense ? "Comfortable rows" : "Compact rows"}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-[11px]">
              <Columns3 className="mr-1 h-3.5 w-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-[11px]">Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns
              .filter((c) => c.header)
              .map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={!hidden.includes(c.key)}
                  disabled={c.locked}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={(v) => setHidden((h) => (v ? h.filter((k) => k !== c.key) : [...h, c.key]))}
                >
                  {c.header}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="size-8" onClick={download} aria-label="Export CSV">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export CSV</TooltipContent>
        </Tooltip>

        {toolbar}
      </div>

      {selectable && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
          <Badge variant="default" className="text-[10px]">
            {selected.length} selected
          </Badge>
          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setSelected([])}>
            Clear
          </Button>
          <Separator orientation="vertical" className="h-5" />
          {bulkActions.map((a) => (
            <Button
              key={a.label}
              size="sm"
              variant={a.destructive ? "destructive" : "outline"}
              className="h-7 text-[11px]"
              disabled={busy}
              onClick={() => runBulk(a)}
            >
              {a.icon}
              <span className={a.icon ? "ml-1" : undefined}>{a.label}</span>
            </Button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {selectable && (
                <TableHead className="w-9">
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={allOnPage}
                    onCheckedChange={(v) =>
                      setSelected((s) => (v ? Array.from(new Set([...s, ...pageIds])) : s.filter((id) => !pageIds.includes(id))))
                    }
                  />
                </TableHead>
              )}
              {visibleColumns.map((c) => {
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
                        {active ? (
                          sort!.dir === 1 ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-30" />
                        )}
                      </button>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: colSpan }).map((__, j) => (
                    <TableCell key={j} className={cellPad}>
                      <Skeleton className="h-3.5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-xs text-muted-foreground">
                  {empty}
                </TableCell>
              </TableRow>
            ) : (
              slice.map((row) => {
                const id = rowKey(row);
                const isSel = selected.includes(id);
                return (
                  <TableRow
                    key={id}
                    data-state={isSel ? "selected" : undefined}
                    className={onRowClick ? "cursor-pointer" : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <TableCell className={cellPad} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label="Select row"
                          checked={isSel}
                          onCheckedChange={(v) => setSelected((s) => (v ? [...s, id] : s.filter((x) => x !== id)))}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((c) => (
                      <TableCell key={c.key} className={`text-xs ${cellPad} ${c.className ?? ""}`}>
                        {c.cell ? c.cell(row) : String(valueOf(row, c))}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          {sorted.length} row{sorted.length === 1 ? "" : "s"}
          {sorted.length !== rows.length ? ` of ${rows.length}` : ""}
          {selectable && selected.length > 0 ? ` · ${selected.length} selected` : ""}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(size)}
            onValueChange={(v) => {
              setSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-7 w-[86px] text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)} className="text-xs">
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" className="size-7" disabled={current === 0} onClick={() => setPage(0)} aria-label="First page">
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="tabular-nums">
            {current + 1} / {pages}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            disabled={current >= pages - 1}
            onClick={() => setPage(pages - 1)}
            aria-label="Last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
