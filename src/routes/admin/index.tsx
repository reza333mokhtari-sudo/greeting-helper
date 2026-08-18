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
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Clock,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  checkAdminAccess,
  getAdminSchema,
  adminTableQuery,
  adminTableUpdate,
  adminTableDelete,
  adminResendVerification,
  adminVerifyUser,
  adminGetUserStats,
  adminDeleteUser,
  adminGenerateLicense,
} from "@/lib/admin.functions";
import { getAdminStats } from "@/lib/admin-stats.functions";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { MoreHorizontal, Mail, UserCheck, UserMinus, Info, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { RowDetailDrawer } from "@/components/admin/RowDetailDrawer";
import { EntityForm } from "@/components/admin/EntityForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { dialog } from "@/lib/dialog";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Control Center" },
      {
        name: "description",
        content: "Microsoft-quality enterprise admin console for Dungeon Scrawl.",
      },
    ],
  }),
  component: AdminConsole,
});

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

type Section = "overview" | "explorer" | "users" | "cms" | "storage" | "diagnostics" | "unverified";

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

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Detail/Edit state
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editingRow, setEditingRow] = useState<any>(null);

  const fetchSchema = useServerFn(getAdminSchema);
  const fetchTable = useServerFn(adminTableQuery);
  const updateTable = useServerFn(adminTableUpdate);
  const deleteFromTable = useServerFn(adminTableDelete);
  const checkAccess = useServerFn(checkAdminAccess);
  const fetchStats = useServerFn(getAdminStats);
  const resendVerification = useServerFn(adminResendVerification);
  const verifyUser = useServerFn(adminVerifyUser);
  const getUserStats = useServerFn(adminGetUserStats);
  const deleteUser = useServerFn(adminDeleteUser);
  const generateLicense = useServerFn(adminGenerateLicense);

  const [userStats, setUserStats] = useState<Record<string, { mapCount: number }>>({});
  const [isVerifying, setIsVerifying] = useState(false);

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
          search: search || undefined,
        },
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
        const { isAdmin } = await checkAccess();
        if (isAdmin) {
          const [s, st] = await Promise.all([fetchSchema(), fetchStats()]);
          setSchema(s);
          setStats(st);
          setState("ok");
        } else {
          setState("denied");
        }
      } catch (e) {
        setState("denied");
      }
    })();
  }, [checkAccess, fetchSchema, fetchStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).join(",");
    const csv = rows
      .map((row) =>
        Object.values(row)
          .map((val) =>
            typeof val === "object" ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${csv}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `${activeTable}_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExit = () => {
    navigate({ to: "/" });
  };

  if (state === "loading") return null;

  if (state === "denied") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 overflow-hidden relative">
        {/* Background Grid Decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-red-500/20 rounded-full animate-pulse" />
            <div className="relative bg-slate-900 border border-red-500/50 p-6 rounded-2xl shadow-2xl">
              <ShieldCheck className="h-16 w-16 text-red-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              Access Denied
            </h1>
            <div className="space-y-2">
              <p className="text-lg text-slate-300 font-medium">System Authorization Failure</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your account does not have the required administrative privileges to access the
                Control Center. This attempt has been logged for security audit purposes.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="outline"
              className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all duration-200"
            >
              Retry Authentication
            </Button>
          </div>

          <div className="pt-8 border-t border-slate-800 w-full">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Terminal ID: {Math.random().toString(36).substring(7).toUpperCase()} • Security Level:
              0
            </p>
          </div>
        </div>
      </main>
    );
  }

  const handleDelete = async (ids: string[]) => {
    if (!activeTable) return;
    const confirmed = await dialog.confirm({
      title: "Confirm Destructive Action",
      message: `Are you absolutely sure you want to delete ${ids.length} record(s) from ${activeTable}? This operation cannot be undone.`,
      confirmText: "Delete Permanently",
      variant: "danger",
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

  const handleResendVerification = async (email: string) => {
    try {
      await resendVerification({ data: { email } });
      toast.success("Verification email resent successfully");
    } catch (e: any) {
      toast.error(`Failed to resend: ${e.message}`);
    }
  };

  const handleManualVerify = async (userId: string) => {
    setIsVerifying(true);
    try {
      await verifyUser({ data: { userId } });
      toast.success("User verified successfully");
      loadData();
    } catch (e: any) {
      toast.error(`Failed to verify: ${e.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFetchUserStats = async (userId: string) => {
    try {
      const stats = await getUserStats({ data: { userId } });
      setUserStats((prev) => ({ ...prev, [userId]: stats }));
    } catch (e: any) {
      console.error("Failed to fetch user stats", e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await dialog.confirm({
      title: "Delete User Account",
      message:
        "This will permanently delete the user account and all associated data. This action is irreversible.",
      confirmText: "Delete User",
      variant: "danger",
    });

    if (confirmed) {
      try {
        await deleteUser({ data: { userId } });
        toast.success("User deleted successfully");
        loadData();
      } catch (e: any) {
        toast.error(`Delete failed: ${e.message}`);
      }
    }
  };

  const handleGenerateLicense = async (
    userId: string,
    type: "trial" | "pro" | "enterprise",
    months?: number,
  ) => {
    try {
      const res = await generateLicense({ data: { userId, type, months } });
      toast.success(`License key generated: ${res.key}`);
      if (activeTable === "licenses") loadData();
    } catch (e: any) {
      toast.error(`Failed to generate: ${e.message}`);
    }
  };

  const renderUnverifiedActions = (row: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleResendVerification(row.email)}>
          <Mail className="mr-2 h-4 w-4" /> Resend Verification
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManualVerify(row.id)}>
          <UserCheck className="mr-2 h-4 w-4" /> Verify Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleFetchUserStats(row.id)}>
          <Info className="mr-2 h-4 w-4" /> About this account
        </DropdownMenuItem>
        {userStats[row.id] !== undefined && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">
            Maps created: {userStats[row.id]?.mapCount ?? 0}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">
          Generate License
        </DropdownMenuLabel>
        {[1, 3, 5, 7, 9, 12, 15].map((m) => (
          <DropdownMenuItem key={m} onClick={() => handleGenerateLicense(row.id, "pro", m)}>
            <Key className="mr-2 h-4 w-4" /> {m} Month{m > 1 ? "s" : ""} Pro
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGenerateLicense(row.id, "enterprise")}>
          <Key className="mr-2 h-4 w-4" /> Enterprise (1 Year)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => handleDeleteUser(row.id)}
        >
          <UserMinus className="mr-2 h-4 w-4" /> Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Enterprise Console
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavBtn
            icon={LayoutDashboard}
            label="Overview"
            active={section === "overview"}
            onClick={() => setSection("overview")}
          />
          <NavBtn
            icon={Database}
            label="Data Explorer"
            active={section === "explorer"}
            onClick={() => {
              setSection("explorer");
              if (!activeTable && schema?.tables.length) setActiveTable(schema.tables[0].name);
            }}
          />
          <NavBtn
            icon={Users}
            label="Users & Roles"
            active={section === "users"}
            onClick={() => {
              setSection("users");
              setActiveTable("profiles");
            }}
          />
          <NavBtn
            icon={AlertTriangle}
            label="Unverified Users"
            active={section === "unverified"}
            onClick={() => {
              setSection("unverified");
              setActiveTable("unverified_users");
            }}
          />
          <NavBtn
            icon={FileText}
            label="CMS Pages"
            active={section === "cms"}
            onClick={() => {
              setSection("cms");
              setActiveTable("cms_pages");
            }}
          />
          <NavBtn
            icon={HardDrive}
            label="Storage"
            active={section === "storage"}
            onClick={() => setSection("storage")}
          />
          <Separator className="my-4" />
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              System
            </p>
          </div>
          <NavBtn icon={Activity} label="Health" active={false} onClick={() => {}} />
          <NavBtn
            icon={AlertTriangle}
            label="Diagnostics"
            active={section === "diagnostics"}
            onClick={() => setSection("diagnostics")}
          />
        </nav>

        <div className="p-4 mt-auto border-t bg-slate-50/50 dark:bg-slate-900/50">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs font-medium"
          >
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
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
            >
              CONNECTED: PRODUCTION
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 p-6">
          {section === "overview" && (
            <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats?.stats.map((s: any, idx: number) => (
                  <StatCard
                    key={idx}
                    label={s.label}
                    value={s.value}
                    icon={idx === 0 ? Users : idx === 1 ? Map : Database}
                    description={s.trend}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-border/60 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" /> Audit Activity
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Last 20 Events
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.chartData || []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--muted-foreground))"
                            opacity={0.1}
                          />
                          <XAxis
                            dataKey="name"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "currentColor", opacity: 0.5 }}
                          />
                          <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "currentColor", opacity: 0.5 }}
                          />
                          <RechartsTooltip
                            cursor={{ fill: "currentColor", opacity: 0.05 }}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "11px",
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {(stats?.chartData || []).map((entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % (COLORS.length || 1)] || "#3b82f6"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5" /> System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <HealthRow label="Database" status="healthy" />
                      <HealthRow label="Auth Service" status="healthy" />
                      <HealthRow label="Storage" status="warning" />
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Recent Logs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/40">
                        {(stats?.recentAudit || []).slice(0, 5).map((log: any) => (
                          <div
                            key={log.id}
                            className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold uppercase">{log.action}</p>
                              <p className="text-[9px] text-muted-foreground font-mono">
                                {log.table_name}
                              </p>
                            </div>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(log.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {(section === "explorer" ||
            section === "users" ||
            section === "cms" ||
            section === "unverified") && (
            <div className="flex h-full gap-6">
              {section === "explorer" && (
                <div className="w-56 shrink-0 space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                    Table Catalog
                  </p>
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
                            : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800",
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
                    columns={
                      currentTableConfig?.columns.map((c: string) => ({
                        key: c,
                        header: c.replace(/_/g, " ").toUpperCase(),
                        type:
                          c.includes("created") || c.includes("updated")
                            ? "date"
                            : c.includes("is_") || c.includes("published")
                              ? "boolean"
                              : c === "doc" || c === "payload"
                                ? "json"
                                : "text",
                      })) || []
                    }
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
                    onEdit={currentTableConfig?.editable?.length ? setEditingRow : undefined}
                    onDelete={currentTableConfig?.deletable ? handleDelete : undefined}
                    onExport={handleExport}
                    actions={activeTable === "unverified_users" ? renderUnverifiedActions : undefined}
                  />
                )}
              </div>
            </div>
          )}

          {section === "storage" && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/20">
              <HardDrive className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg text-slate-400">Storage Studio</h3>
              <p className="text-sm text-muted-foreground">
                Browse buckets and objects (Coming in next patch)
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Detail View */}
      <RowDetailDrawer
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        row={selectedRow}
        tableName={activeTable || ""}
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
              fields={
                currentTableConfig?.editable.map((f: string) => ({
                  name: f,
                  label: f.replace(/_/g, " ").toUpperCase(),
                  type:
                    f.includes("body") || f.includes("message")
                      ? "textarea"
                      : f.includes("is_") || f.includes("published")
                        ? "boolean"
                        : "text",
                })) || []
              }
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
          : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50",
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
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {label}
          </p>
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
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {status}
        </span>
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            status === "healthy"
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : "bg-orange-500 animate-pulse",
          )}
        />
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
