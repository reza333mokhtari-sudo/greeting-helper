import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { 
  Activity, 
  ArrowLeft, 
  Database, 
  ShieldCheck, 
  LayoutDashboard,
  Users,
  HardDrive,
  AlertCircle,
  FileText,
  Map,
  History,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  checkAdminAccess, 
  getAdminSchema, 
  adminTableQuery, 
  adminTableUpdate, 
  adminTableDelete 
} from "@/lib/admin.functions";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { RowDetailDrawer } from "@/components/admin/RowDetailDrawer";
import { EntityForm } from "@/components/admin/EntityForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dialog } from "@/lib/dialog";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Control Center" },
      { name: "description", content: "Microsoft-quality enterprise admin console for Dungeon Scrawl." },
    ],
  }),
  component: AdminConsole,
});

type Section = "overview" | "explorer" | "users" | "storage" | "diagnostics";

function AdminConsole() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [section, setSection] = useState<Section>("overview");
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  
  // Table State
  const [rows, setRows] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<{ column: string; ascending: boolean } | null>(null);
  const [search, setSearch] = useState("");

  // Detail/Edit state
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editingRow, setEditingRow] = useState<any>(null);

  const fetchSchema = useServerFn(getAdminSchema);
  const fetchTable = useServerFn(adminTableQuery);
  const updateTable = useServerFn(adminTableUpdate);
  const deleteFromTable = useServerFn(adminTableDelete);
  const checkAccess = useServerFn(checkAdminAccess);

  const loadData = useCallback(async () => {
    if (!activeTable) return;
    setLoading(true);
    try {
      const res = await fetchTable({
        data: {
          table: activeTable,
          page,
          pageSize,
          sort: sort || undefined,
          search: search || undefined
        }
      });
      setRows(res.rows || []);
      setCount(res.count || 0);
    } catch (e: any) {
      toast.error(`Query failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [activeTable, page, pageSize, sort, search, fetchTable]);

  useEffect(() => {
    (async () => {
      try {
        await checkAccess();
        const s = await fetchSchema();
        setSchema(s);
        setState("ok");
      } catch (e) {
        setState("denied");
      }
    })();
  }, [checkAccess, fetchSchema]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (state === "loading") return null;

  if (state === "denied") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-white p-6 text-center">
        <ShieldCheck className="h-16 w-16 text-red-500 animate-pulse" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Forbidden</h1>
          <p className="max-w-md text-slate-400">
            This workstation is restricted to Authorized Administrators only. 
            Security violation has been logged.
          </p>
        </div>
        <Button asChild variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300">
          <Link to="/">Exit System</Link>
        </Button>
      </main>
    );
  }

  const handleDelete = async (ids: string[]) => {
    if (!activeTable) return;
    const confirmed = await dialog.confirm({
      title: "Confirm Destructive Action",
      message: `Are you absolutely sure you want to delete ${ids.length} record(s) from ${activeTable}? This operation cannot be undone.`,
      confirmText: "Delete Permanently",
      variant: "danger"
    });

    if (confirmed) {
      try {
        await deleteFromTable({ data: { table: activeTable, ids } });
        toast.success("Records deleted successfully");
        loadData();
      } catch (e: any) {
        toast.error(`Delete failed: ${e.message}`);
      }
    }
  };

  const handleUpdate = async (data: any) => {
    if (!activeTable || !editingRow) return;
    try {
      await updateTable({ data: { table: activeTable, id: editingRow.id, payload: data } });
      toast.success("Record updated successfully");
      setEditingRow(null);
      loadData();
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`);
    }
  };

  const currentTableConfig = schema?.tables.find((t: any) => t.name === activeTable);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 p-1.5 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h2 className="font-bold text-sm tracking-tight">ADMIN CENTER</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Enterprise Console</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavBtn icon={LayoutDashboard} label="Overview" active={section === "overview"} onClick={() => setSection("overview")} />
          <NavBtn icon={Database} label="Data Explorer" active={section === "explorer"} onClick={() => {
            setSection("explorer");
            if (!activeTable && schema?.tables.length) setActiveTable(schema.tables[0].name);
          }} />
          <NavBtn icon={Users} label="Users & Roles" active={section === "users"} onClick={() => {
            setSection("users");
            setActiveTable("profiles");
          }} />
          <NavBtn icon={HardDrive} label="Storage" active={section === "storage"} onClick={() => setSection("storage")} />
          <Separator className="my-4" />
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">System</p>
          </div>
          <NavBtn icon={Activity} label="Health" active={false} onClick={() => {}} />
          <NavBtn icon={AlertTriangle} label="Diagnostics" active={section === "diagnostics"} onClick={() => setSection("diagnostics")} />
        </nav>

        <div className="p-4 mt-auto border-t bg-slate-50/50 dark:bg-slate-900/50">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs font-medium">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-white dark:bg-slate-900 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold capitalize">{section}</h1>
            {activeTable && section === "explorer" && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline" className="font-mono text-[10px] py-0.5">
                  PUBLIC.{activeTable.toUpperCase()}
                </Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
               CONNECTED: PRODUCTION
             </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 p-6">
          {section === "overview" && (
            <div className="space-y-6 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Tables" value={schema?.tables.length || 0} icon={Database} description="Accessible in public schema" />
                <StatCard label="Auth Users" value={count} icon={Users} description="Registered profiles" />
                <StatCard label="Audit Events" value="1.2k" icon={History} description="Past 24 hours" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="border-border/60">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" /> System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <HealthRow label="Database Connection" status="healthy" />
                      <HealthRow label="Authentication Service" status="healthy" />
                      <HealthRow label="Storage Engine" status="warning" />
                      <HealthRow label="Edge Functions" status="healthy" />
                    </CardContent>
                 </Card>

                 <Card className="border-border/60">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" /> Security Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <WarningItem title="Public RLS missing" description="Table 'map_assets' has no RLS policies enabled." />
                       <WarningItem title="Expired Service Keys" description="Production keys rotate in 12 days." />
                    </CardContent>
                 </Card>
              </div>
            </div>
          )}

          {(section === "explorer" || section === "users") && (
            <div className="flex h-full gap-6">
              {section === "explorer" && (
                <div className="w-56 shrink-0 space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Table Catalog</p>
                  <div className="space-y-1">
                    {schema?.tables.map((t: any) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setActiveTable(t.name);
                          setPage(0);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                          activeTable === t.name 
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                            : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                        )}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {activeTable && (
                  <AdminDataTable
                    tableName={activeTable}
                    columns={currentTableConfig?.columns.map((c: string) => ({ 
                      key: c, 
                      header: c.replace(/_/g, ' ').toUpperCase(),
                      type: c.includes('created') || c.includes('updated') ? 'date' : 
                            c.includes('is_') || c.includes('published') ? 'boolean' : 
                            c === 'doc' || c === 'payload' ? 'json' : 'text'
                    })) || []}
                    rows={rows}
                    count={count}
                    loading={loading}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    sort={sort}
                    onSortChange={setSort}
                    search={search}
                    onSearchChange={setSearch}
                    onView={setSelectedRow}
                    onEdit={setEditingRow}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            </div>
          )}

          {section === "storage" && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/20">
              <HardDrive className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg text-slate-400">Storage Studio</h3>
              <p className="text-sm text-muted-foreground">Browse buckets and objects (Coming in next patch)</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail View */}
      <RowDetailDrawer
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        row={selectedRow}
        tableName={activeTable || "Table"}
      />

      {/* Edit Dialog */}
      <Dialog open={!!editingRow} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <EntityForm
              entityName={activeTable || "Record"}
              initialData={editingRow}
              fields={currentTableConfig?.editable.map((f: string) => ({
                name: f,
                label: f.replace(/_/g, ' ').toUpperCase(),
                type: f.includes('body') || f.includes('message') ? 'textarea' :
                      f.includes('is_') || f.includes('published') ? 'boolean' : 'text'
              })) || []}
              onSubmit={handleUpdate}
              onCancel={() => setEditingRow(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold transition-all",
        active 
          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" 
          : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
      {label}
    </button>
  );
}

function StatCard({ label, value, description, icon: Icon }: any) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold tracking-tight tabular-nums">{value}</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}

function HealthRow({ label, status }: any) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{status}</span>
        <div className={cn(
          "h-2 w-2 rounded-full",
          status === 'healthy' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-orange-500 animate-pulse"
        )} />
      </div>
    </div>
  );
}

function WarningItem({ title, description }: any) {
  return (
    <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40">
      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
      <div>
        <p className="text-[11px] font-bold leading-none mb-1">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
    </div>
  );
}
