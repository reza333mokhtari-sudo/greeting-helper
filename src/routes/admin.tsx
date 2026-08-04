import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [maps, setMaps] = useState<MapRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);

  const load = useCallback(async () => {
    const [p, r, m, c] = await Promise.all([
      supabase.from("profiles").select("id,display_name,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("id,user_id,role"),
      supabase.from("maps").select("id,name,user_id,is_public,share_slug,updated_at").order("updated_at", { ascending: false }),
      supabase.from("cms_pages").select("id,slug,title,body,published,updated_at").order("updated_at", { ascending: false }),
    ]);
    setProfiles((p.data ?? []) as Profile[]);
    setRoles((r.data ?? []) as RoleRow[]);
    setMaps((m.data ?? []) as MapRow[]);
    setPages((c.data ?? []) as PageRow[]);
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

  const roleOf = (userId: string) => roles.find((r) => r.user_id === userId)?.role ?? "user";

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

  const userCols: Column<Profile>[] = [
    { key: "name", header: "User", value: (r) => r.display_name ?? "(no name)" },
    { key: "id", header: "ID", value: (r) => r.id, cell: (r) => <span className="font-mono text-[10px] text-muted-foreground">{r.id.slice(0, 8)}…</span> },
    {
      key: "role",
      header: "Role",
      value: (r) => roleOf(r.id),
      cell: (r) => <Badge variant={roleOf(r.id) === "admin" ? "default" : "secondary"}>{roleOf(r.id)}</Badge>,
    },
    { key: "created", header: "Joined", value: (r) => r.created_at, cell: (r) => new Date(r.created_at).toLocaleDateString() },
    {
      key: "actions",
      header: "Set role",
      sortable: false,
      cell: (r) => (
        <div className="flex gap-1">
          {(["user", "moderator", "admin"] as const).map((role) => (
            <Button key={role} size="sm" variant={roleOf(r.id) === role ? "default" : "outline"} className="h-6 px-2 text-[10px]" onClick={() => setRole(r.id, role)}>
              {role}
            </Button>
          ))}
        </div>
      ),
    },
  ];

  const mapCols: Column<MapRow>[] = [
    { key: "name", header: "Map", value: (r) => r.name },
    { key: "owner", header: "Owner", value: (r) => profiles.find((p) => p.id === r.user_id)?.display_name ?? r.user_id },
    {
      key: "public",
      header: "Shared",
      value: (r) => (r.is_public ? "yes" : "no"),
      cell: (r) =>
        r.is_public ? (
          <a className="text-primary underline" href={`/m/${r.share_slug}`} target="_blank" rel="noreferrer">
            public link
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

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center gap-3">
          <h1 className="text-lg font-semibold uppercase tracking-[0.18em] text-arcane">Admin panel</h1>
          <Badge variant="outline" className="text-[10px]">{profiles.length} users</Badge>
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link to="/">Back to editor</Link>
          </Button>
        </header>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users &amp; roles</TabsTrigger>
            <TabsTrigger value="maps">Maps</TabsTrigger>
            <TabsTrigger value="cms">CMS pages</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <DataTable rows={profiles} columns={userCols} rowKey={(r) => r.id} empty="No users yet." />
          </TabsContent>

          <TabsContent value="maps" className="mt-4">
            <DataTable rows={maps} columns={mapCols} rowKey={(r) => r.id} empty="No maps saved yet." />
          </TabsContent>

          <TabsContent value="cms" className="mt-4">
            <CmsTab pages={pages} reload={load} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function CmsTab({ pages, reload }: { pages: PageRow[]; reload: () => void }) {
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
    { key: "title", header: "Title", value: (r) => r.title },
    { key: "slug", header: "Slug", value: (r) => r.slug, cell: (r) => <span className="font-mono text-[11px]">/p/{r.slug}</span> },
    {
      key: "published",
      header: "Status",
      value: (r) => (r.published ? "published" : "draft"),
      cell: (r) => <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Draft"}</Badge>,
    },
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

  return (
    <>
      <DataTable
        rows={pages}
        columns={cols}
        rowKey={(r) => r.id}
        empty="No content pages yet."
        toolbar={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8" onClick={startNew}>
                <Plus className="mr-1 h-3.5 w-3.5" /> New page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit page" : "New page"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase() }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Body (markdown-ish text)</Label>
                  <Textarea rows={8} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
                  <Label className="text-xs">Published</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={save}>Save page</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
    </>
  );
}
