import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Download,
  Trash2,
  Edit,
  Eye,
  Columns,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  header: string;
  type?: "text" | "number" | "boolean" | "date" | "json";
  sortable?: boolean;
}

interface AdminDataTableProps {
  columns: Column[];
  rows: any[];
  count: number;
  loading?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sort: { column: string; ascending: boolean } | null;
  onSortChange: (sort: { column: string; ascending: boolean } | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onEdit?: (row: any) => void | undefined;
  onDelete?: (ids: string[]) => void | undefined;
  onView?: (row: any) => void | undefined;
  tableName: string;
  onExport?: () => void;
  actions?: (row: any) => React.ReactNode;
}

export function AdminDataTable({
  columns,
  rows,
  count,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  onView,
  tableName,
  onExport,
  actions,
}: AdminDataTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map((c) => c.key));

  const totalPages = Math.ceil(count / pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(rows.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSort = (columnKey: string) => {
    if (sort?.column === columnKey) {
      if (sort.ascending) {
        onSortChange({ column: columnKey, ascending: false });
      } else {
        onSortChange(null);
      }
    } else {
      onSortChange({ column: columnKey, ascending: true });
    }
  };

  const exportToCsv = () => {
    if (!rows.length) return;
    const headers = columns
      .filter((c) => visibleColumns.includes(c.key))
      .map((c) => c.header)
      .join(",");
    const csvData = rows
      .map((row) =>
        columns
          .filter((c) => visibleColumns.includes(c.key))
          .map((c) => {
            const val = row[c.key];
            return typeof val === "object"
              ? `"${JSON.stringify(val).replace(/"/g, '""')}"`
              : `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${csvData}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${tableName}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(selectedIds);
                setSelectedIds([]);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedIds.length})
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={visibleColumns.includes(col.key)}
                  onCheckedChange={(checked) => {
                    setVisibleColumns((prev) =>
                      checked ? [...prev, col.key] : prev.filter((k) => k !== col.key),
                    );
                  }}
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onExport || exportToCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={rows.length > 0 && selectedIds.length === rows.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {columns
                .filter((c) => visibleColumns.includes(c.key))
                .map((col) => (
                  <TableHead key={col.key} className="whitespace-nowrap">
                    {col.sortable !== false ? (
                      <button
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => handleSort(col.key)}
                      >
                        {col.header}
                        {sort?.column === col.key ? (
                          sort.ascending ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  {columns
                    .filter((c) => visibleColumns.includes(c.key))
                    .map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 2}
                  className="h-24 text-center text-muted-foreground"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                    />
                  </TableCell>
                  {columns
                    .filter((c) => visibleColumns.includes(c.key))
                    .map((col) => (
                      <TableCell key={col.key} className="max-w-xs truncate">
                        {renderCell(row[col.key], col.type)}
                      </TableCell>
                    ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      {actions?.(row)}
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onView(row)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(row)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete([row.id])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 py-2">
        <div className="text-sm text-muted-foreground">
          Showing {rows.length} of {count} records
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-[70px] rounded-md border bg-background text-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {page + 1} of {totalPages || 1}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(0)}
              disabled={page === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCell(value: any, type?: string) {
  if (value === null || value === undefined)
    return <span className="text-muted-foreground italic">null</span>;

  switch (type) {
    case "boolean":
      return <Badge variant={value ? "default" : "secondary"}>{value ? "True" : "False"}</Badge>;
    case "date":
      return new Date(value).toLocaleDateString();
    case "json":
      return (
        <code className="text-[10px] bg-muted px-1 rounded">
          {JSON.stringify(value).slice(0, 50)}...
        </code>
      );
    default:
      return String(value);
  }
}
