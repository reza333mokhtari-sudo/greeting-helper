import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cloud, CloudUpload, FolderOpen, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { createMap, deleteMap, listMaps, loadMap, updateMap, type MapRow } from "@/lib/cloud";
import type { Doc } from "@/lib/dungeon/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareDialog } from "./ShareDialog";

type Props = {
  doc: Doc;
  thumbnail: () => string | null;
  onLoadDoc: (doc: Doc) => void;
};

export function CloudBar({ doc, thumbnail, onLoadDoc }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [maps, setMaps] = useState<MapRow[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<MapRow | null>(null);
  const [name, setName] = useState("Untitled map");
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Show the admin entry point only to accounts that actually hold the role.
  useEffect(() => {
    if (!email) {
      setIsAdmin(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }).then(({ data: ok }) => setIsAdmin(!!ok));
    });
  }, [email]);


  const refresh = useCallback(() => {
    listMaps()
      .then(setMaps)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (email) refresh();
    else setMaps([]);
  }, [email, refresh]);

  const save = async () => {
    if (!email) return;
    setBusy(true);
    try {
      if (current) {
        await updateMap(current.id, { name, doc, thumbnail_url: thumbnail() });
        toast.success("Map saved to the cloud");
      } else {
        const row = await createMap(name, doc, thumbnail());
        setCurrent(row);
        toast.success("Map saved to the cloud");
      }
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
    setBusy(false);
  };

  const open_ = async (row: MapRow) => {
    try {
      const { name: n, doc: d } = await loadMap(row.id);
      onLoadDoc(d);
      setCurrent(row);
      setName(n);
      setOpen(false);
      toast.success(`Opened “${n}”`);
    } catch {
      toast.error("Could not open that map");
    }
  };

  const togglePublic = async (row: MapRow, value: boolean) => {
    await updateMap(row.id, { is_public: value });
    setMaps((m) => m.map((x) => (x.id === row.id ? { ...x, is_public: value } : x)));
    if (current?.id === row.id) setCurrent((c) => (c ? { ...c, is_public: value } : c));
  };


  if (!email) {
    return (
      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
        <Link to="/auth" search={{ next: "/" }}>
          <Cloud className="mr-1 h-3.5 w-3.5" /> Sign in to save
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="h-7 w-40 text-xs" placeholder="Map name" />
      <Button size="sm" className="h-7 text-xs" disabled={busy} onClick={save}>
        <CloudUpload className="mr-1 h-3.5 w-3.5" /> Save
      </Button>

      <Dialog open={open} onOpenChange={(v) => (setOpen(v), v && refresh())}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <FolderOpen className="mr-1 h-3.5 w-3.5" /> My maps
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>My maps</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-2">
              {maps.length === 0 && <p className="text-xs text-muted-foreground">No saved maps yet.</p>}
              {maps.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-2">
                  {m.thumbnail_url ? (
                    <img src={m.thumbnail_url} alt="" className="h-10 w-14 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-14 rounded bg-muted" />
                  )}
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open_(m)}>
                    <p className="truncate text-xs font-medium">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(m.updated_at).toLocaleString()}</p>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={m.is_public ? "default" : "secondary"} className="text-[9px]">
                      {m.is_public ? "Public" : "Private"}
                    </Badge>
                    <Switch checked={m.is_public} onCheckedChange={(v) => togglePublic(m, v)} />
                    <ShareDialog row={m} onTogglePublic={(v) => togglePublic(m, v)} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={async () => {
                        await deleteMap(m.id);
                        if (current?.id === m.id) setCurrent(null);
                        refresh();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-[10px]">
          <Link to="/admin">Admin</Link>
        </Button>
      )}

      <Button size="icon" variant="ghost" className="h-7 w-7" title={email} onClick={() => supabase.auth.signOut()}>
        <LogOut className="h-3.5 w-3.5" />
      </Button>

    </div>
  );
}
