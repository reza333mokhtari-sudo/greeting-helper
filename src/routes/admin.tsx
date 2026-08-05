import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  FileText,
  Globe,
  Loader2,
  Map as MapIcon,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { DataTable, type BulkAction, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin panel — Dungeon Scrawl Map Maker" },
      { name: "description", content: "Manage users, roles, maps and CMS pages for the Dungeon Scrawl map maker." },
      { property: "og:title", content: "Admin panel — Dungeon Scrawl Map Maker" },
      { property: "og:description", content: "Manage users, roles, maps and content pages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Profile = { id: string; display_name: string | null; created_at: string };
type RoleRow = { id: string; user_id: string; role: "admin" | "moderator" | "user" };
type MapRow = { id: string; name: string; user_id: string; is_public: boolean; share_slug: string; updated_at: string };
type PageRow = { id: string; slug: string; title: string; body: string; published: boolean; updated_at: string };

type Section = "overview" | "users" | "maps" | "cms" | "tickets";

const NAV: { key: Section; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "users", label: "Users & roles", icon: Users },
  { key: "maps", label: "Maps", icon: MapIcon },
  { key: "cms", label: "CMS pages", icon: FileText },
  { key: "tickets", label: "Support Tickets", icon: MessageSquare },
];

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [section, setSection] = useState<Section>("overview");
  const [busy, setBusy] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [maps, setMaps] = useState<MapRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  const load = useCallback(async () => {
    setBusy(true);
    const [p, r, m, c, t] = await Promise.all([
      supabase.from("profiles").select("id,display_name,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("id,user_id,role"),
      supabase.from("maps").select("id,name,user_id,is_public,share_slug,updated_at").order("updated_at", { ascending: false }),
      supabase.from("cms_pages").select("id,slug,title,body,published,updated_at").order("updated_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles((p.data ?? []) as Profile[]);
    setRoles((r.data ?? []) as RoleRow[]);
    setMaps((m.data ?? []) as MapRow[]);
    setPages((c.data ?? []) as PageRow[]);
    setTickets(t.data ?? []);
    setBusy(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        navigate({ to: "/auth", search: { next: "/admin" } });
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
      if (!isAdmin) {
        setState("denied");
        return;
      }
      await load();
      setState("ok");
    })();
  }, [load, navigate]);

  const roleOf = useCallback(
    (userId: string) => roles.find((r) => r.user_id === userId)?.role ?? "user",
    [roles],
  );

  const stats = useMemo(
    () => [
      { label: "Users", value: profiles.length, icon: Users, hint: `${roles.filter((r) => r.role === "admin").length} admins` },
      { label: "Maps", value: maps.length, icon: MapIcon, hint: `${maps.filter((m) => m.is_public).length} shared publicly` },
      { label: "CMS pages", value: pages.length, icon: FileText, hint: `${pages.filter((p) => p.published).length} published` },
      { label: "Tickets", value: tickets.length, icon: MessageSquare, hint: `${tickets.filter(t => t.status === 'open').length} open` },
      {
        label: "Active this week",
        value: maps.filter((m) => Date.now() - new Date(m.updated_at).getTime() < 7 * 864e5).length,
        icon: Activity,
        hint: "maps edited in 7 days",
      },
    ],
    [profiles, roles, maps, pages],
  );

  if (state === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <ShieldCheck className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Admins only</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This area is restricted. Ask an existing administrator to grant your account the admin role.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to the map editor</Link>
        </Button>
      </main>
    );
  }

  const setRole = async (userId: string, role: RoleRow["role"]) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    if (role !== "user") {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success("Role updated");
    load();
  };

  const initials = (name: string | null, id: string) =>
    (name ?? id).replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "??";

  const userCols: Column<Profile>[] = [
    {
      key: "name",
      header: "User",
      locked: true,
      value: (r) => r.display_name ?? "(no name)",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">{initials(r.display_name, r.id)}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="font-medium">{r.display_name ?? "(no name)"}</div>
            <div className="font-mono text-[10px] text-muted-foreground">{r.id.slice(0, 8)}…</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      value: (r) => roleOf(r.id),
      cell: (r) => (
        <Badge variant={roleOf(r.id) === "admin" ? "default" : roleOf(r.id) === "moderator" ? "outline" : "secondary"}>
          {roleOf(r.id)}
        </Badge>
      ),
    },
    { key: "maps", header: "Maps", value: (r) => maps.filter((m) => m.user_id === r.id).length },
    { key: "created", header: "Joined", value: (r) => r.created_at, cell: (r) => new Date(r.created_at).toLocaleDateString() },
    {
      key: "actions",
      header: "Set role",
      sortable: false,
      cell: (r) => (
        <Select value={roleOf(r.id)} onValueChange={(v) => setRole(r.id, v as RoleRow["role"])}>
          <SelectTrigger className="h-7 w-[116px] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["user", "moderator", "admin"] as const).map((role) => (
              <SelectItem key={role} value={role} className="text-xs">
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  const userBulk: BulkAction<Profile>[] = [
    {
      label: "Make moderator",
      run: async (rows) => {
        for (const r of rows) await setRole(r.id, "moderator");
      },
    },
    {
      label: "Reset to user",
      run: async (rows) => {
        for (const r of rows) await setRole(r.id, "user");
      },
    },
  ];

  const mapCols: Column<MapRow>[] = [
    { key: "name", header: "Map", locked: true, value: (r) => r.name },
    { key: "owner", header: "Owner", value: (r) => profiles.find((p) => p.id === r.user_id)?.display_name ?? r.user_id },
    {
      key: "public",
      header: "Shared",
      value: (r) => (r.is_public ? "yes" : "no"),
      cell: (r) =>
        r.is_public ? (
          <a className="inline-flex items-center gap-1 text-primary underline" href={`/m/${r.share_slug}`} target="_blank" rel="noreferrer">
            <Globe className="h-3 w-3" /> public link
          </a>
        ) : (
          <span className="text-muted-foreground">private</span>
        ),
    },
    { key: "updated", header: "Updated", value: (r) => r.updated_at, cell: (r) => new Date(r.updated_at).toLocaleString() },
    {
      key: "actions",
      header: "",
      sortable: false,
      cell: (r) => (
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-destructive"
          aria-label={`Delete ${r.name}`}
          onClick={async () => {
            if (!window.confirm(`Delete map "${r.name}"?`)) return;
            const { error } = await supabase.from("maps").delete().eq("id", r.id);
            if (error) toast.error(error.message);
            else load();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  const mapBulk: BulkAction<MapRow>[] = [
    {
      label: "Make public",
      run: async (rows) => {
        const { error } = await supabase.from("maps").update({ is_public: true }).in("id", rows.map((r) => r.id));
        if (error) toast.error(error.message);
        else toast.success(`${rows.length} map(s) shared`);
        load();
      },
    },
    {
      label: "Make private",
      run: async (rows) => {
        const { error } = await supabase.from("maps").update({ is_public: false }).in("id", rows.map((r) => r.id));
        if (error) toast.error(error.message);
        else toast.success(`${rows.length} map(s) unshared`);
        load();
      },
    },
    {
      label: "Delete",
      destructive: true,
      icon: <Trash2 className="h-3 w-3" />,
      run: async (rows) => {
        if (!window.confirm(`Delete ${rows.length} map(s)?`)) return;
        const { error } = await supabase.from("maps").delete().in("id", rows.map((r) => r.id));
        if (error) toast.error(error.message);
        else toast.success("Maps deleted");
        load();
      },
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <aside className="hidden w-52 shrink-0 md:block">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-arcane" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-arcane">Admin</span>
            </div>
            <nav className="space-y-1">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setSection(n.key)}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                    section === n.key ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <n.icon className="h-3.5 w-3.5" />
                  {n.label}
                </button>
              ))}
            </nav>
            <Separator />
            <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Link to="/">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to editor
              </Link>
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <header className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold">{NAV.find((n) => n.key === section)?.label}</h1>
            <Badge variant="outline" className="text-[10px]">
              {profiles.length} users
            </Badge>
            <div className="ml-auto flex gap-1 md:hidden">
              {NAV.map((n) => (
                <Button
                  key={n.key}
                  size="icon"
                  variant={section === n.key ? "default" : "outline"}
                  className="size-8"
                  aria-label={n.label}
                  onClick={() => setSection(n.key)}
                >
                  <n.icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="border-border/60">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-md bg-primary/15 p-2">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xl font-semibold tabular-nums">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground/70">{s.hint}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {section === "overview" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/60">
                <CardContent className="space-y-3 p-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent maps</h2>
                  <DataTable
                    rows={maps.slice(0, 20)}
                    columns={mapCols.filter((c) => c.key !== "actions")}
                    rowKey={(r) => r.id}
                    pageSize={5}
                    loading={busy}
                    exportName="recent-maps"
                    empty="No maps yet."
                  />
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="space-y-3 p-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Newest users</h2>
                  <DataTable
                    rows={profiles.slice(0, 20)}
                    columns={userCols.filter((c) => c.key !== "actions")}
                    rowKey={(r) => r.id}
                    pageSize={5}
                    loading={busy}
                    exportName="recent-users"
                    empty="No users yet."
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {section === "users" && (
            <DataTable
              rows={profiles}
              columns={userCols}
              rowKey={(r) => r.id}
              empty="No users yet."
              loading={busy}
              selectable
              bulkActions={userBulk}
              onRefresh={load}
              exportName="users"
              facets={[
                { key: "admins", label: "Admins", test: (r) => roleOf(r.id) === "admin" },
                { key: "mods", label: "Moderators", test: (r) => roleOf(r.id) === "moderator" },
              ]}
            />
          )}

          {section === "maps" && (
            <DataTable
              rows={maps}
              columns={mapCols}
              rowKey={(r) => r.id}
              empty="No maps saved yet."
              loading={busy}
              selectable
              bulkActions={mapBulk}
              onRefresh={load}
              exportName="maps"
              facets={[
                { key: "public", label: "Public", test: (r) => r.is_public },
                { key: "week", label: "Edited this week", test: (r) => Date.now() - new Date(r.updated_at).getTime() < 7 * 864e5 },
              ]}
            />
          )}

          {section === "cms" && <CmsTab pages={pages} reload={load} loading={busy} />}
          {section === "tickets" && (
            <DataTable
              rows={tickets}
              columns={[
                { key: "user", header: "User", value: (t) => profiles.find(p => p.id === t.user_id)?.display_name || t.user_id },
                { key: "subject", header: "Subject", value: (t) => t.subject },
                { key: "status", header: "Status", cell: (t) => (
                  <Badge variant={t.status === 'open' ? 'destructive' : t.status === 'closed' ? 'secondary' : 'default'}>
                    {t.status}
                  </Badge>
                )},
                { key: "created", header: "Date", value: (t) => new Date(t.created_at).toLocaleString() },
                { key: "actions", header: "", sortable: false, cell: (t) => (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">View</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.subject}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
                            <p className="text-sm">{profiles.find(p => p.id === t.user_id)?.display_name || t.user_id}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Message</p>
                            <p className="text-sm whitespace-pre-wrap">{t.message}</p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <Label>Update Status</Label>
                            <Select 
                              defaultValue={t.status} 
                              onValueChange={async (v) => {
                                await supabase.from('support_tickets').update({ status: v }).eq('id', t.id);
                                load();
                                toast.success("Status updated");
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              ]}
              rowKey={(r) => r.id}
              loading={busy}
              onRefresh={load}
              exportName="support-tickets"
            />
          )}
        </div>
      </div>
    </main>
  );
}

function CmsTab({ pages, reload, loading }: { pages: PageRow[]; reload: () => void; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", body: "", published: false });

  const startNew = () => {
    setEditing(null);
    setForm({ slug: "", title: "", body: "", published: false });
    setOpen(true);
  };
  const startEdit = (p: PageRow) => {
    setEditing(p);
    setForm({ slug: p.slug, title: p.title, body: p.body, published: p.published });
    setOpen(true);
  };

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim()) {
      toast.error("Slug and title are required");
      return;
    }
    const payload = { slug: form.slug.trim(), title: form.title.trim(), body: form.body, published: form.published };
    const { error } = editing
      ? await supabase.from("cms_pages").update(payload).eq("id", editing.id)
      : await supabase.from("cms_pages").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Page updated" : "Page created");
    setOpen(false);
    reload();
  };

  const cols: Column<PageRow>[] = [
    { key: "title", header: "Title", locked: true, value: (r) => r.title },
    { key: "slug", header: "Slug", value: (r) => r.slug, cell: (r) => <span className="font-mono text-[11px]">/p/{r.slug}</span> },
    {
      key: "published",
      header: "Status",
      value: (r) => (r.published ? "published" : "draft"),
      cell: (r) => <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Draft"}</Badge>,
    },
    { key: "words", header: "Words", value: (r) => r.body.trim().split(/\s+/).filter(Boolean).length },
    { key: "updated", header: "Updated", value: (r) => r.updated_at, cell: (r) => new Date(r.updated_at).toLocaleString() },
    {
      key: "actions",
      header: "",
      sortable: false,
      cell: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => startEdit(r)}>
            Edit
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6 text-destructive"
            aria-label={`Delete ${r.title}`}
            onClick={async () => {
              if (!window.confirm(`Delete page "${r.title}"?`)) return;
              const { error } = await supabase.from("cms_pages").delete().eq("id", r.id);
              if (error) toast.error(error.message);
              else reload();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const bulk: BulkAction<PageRow>[] = [
    {
      label: "Publish",
      run: async (rows) => {
        const { error } = await supabase.from("cms_pages").update({ published: true }).in("id", rows.map((r) => r.id));
        if (error) toast.error(error.message);
        else toast.success("Pages published");
        reload();
      },
    },
    {
      label: "Unpublish",
      run: async (rows) => {
        const { error } = await supabase.from("cms_pages").update({ published: false }).in("id", rows.map((r) => r.id));
        if (error) toast.error(error.message);
        else toast.success("Pages moved to draft");
        reload();
      },
    },
    {
      label: "Delete",
      destructive: true,
      icon: <Trash2 className="h-3 w-3" />,
      run: async (rows) => {
        if (!window.confirm(`Delete ${rows.length} page(s)?`)) return;
        const { error } = await supabase.from("cms_pages").delete().in("id", rows.map((r) => r.id));
        if (error) toast.error(error.message);
        else toast.success("Pages deleted");
        reload();
      },
    },
  ];

  return (
    <DataTable
      rows={pages}
      columns={cols}
      rowKey={(r) => r.id}
      empty="No content pages yet."
      loading={loading}
      selectable
      bulkActions={bulk}
      onRefresh={reload}
      exportName="cms-pages"
      onRowClick={startEdit}
      facets={[
        { key: "published", label: "Published", test: (r) => r.published },
        { key: "drafts", label: "Drafts", test: (r) => !r.published },
      ]}
      toolbar={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8" onClick={startNew}>
              <Plus className="mr-1 h-3.5 w-3.5" /> New page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit page" : "New page"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase() }))}
                  />
                  <p className="text-[10px] text-muted-foreground">Public URL: /p/{form.slug || "…"}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Body (markdown-ish text)</Label>
                  <Textarea rows={10} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
                  <Label className="text-xs">Published</Label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Live preview</Label>
                <div className="h-[340px] overflow-auto rounded-md border border-border/60 bg-muted/20 p-3">
                  <h3 className="mb-2 text-sm font-semibold">{form.title || "Untitled page"}</h3>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                    {form.body || "Start typing to see the page preview."}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save page</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    />
  );
}
