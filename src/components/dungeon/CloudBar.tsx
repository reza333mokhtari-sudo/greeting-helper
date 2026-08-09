import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Cloud, CloudUpload, FolderOpen, LogOut, Trash2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShareDialog } from "./ShareDialog";


type Props = {
  doc: Doc;
  thumbnail: () => string | null;
  onLoadDoc: (doc: Doc) => void;
  onAuthRequired?: () => void;
  saveStatus?: "idle" | "saving" | "saved" | "error";
};

export function CloudBar({ doc, thumbnail, onLoadDoc, onAuthRequired, saveStatus: externalSaveStatus }: Props) {


  const [email, setEmail] = useState<string | null>(null);
  const [maps, setMaps] = useState<MapRow[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<MapRow | null>(null);
  const [name, setName] = useState("Untitled map");
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [internalSyncStatus, setInternalSyncStatus] = useState<"idle" | "saving" | "synced" | "error">("idle");
  const syncStatus = externalSaveStatus === "saved" ? "synced" : (externalSaveStatus || internalSyncStatus);
  const [localLastSaved, setLocalLastSaved] = useState<number | null>(null);



  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Show the admin entry point only to accounts that actually hold the role.
  useEffect(() => {
    if (!email) {
      setIsAdmin(false);
      return;
    }
    supabase.auth.getUser().then(({ data }: any) => {
      if (!data.user) return;
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }).then(({ data: ok }: any) => setIsAdmin(!!ok));
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
    if (!email) {
      // Manual save for local users
      setInternalSyncStatus("saving");
      try {
        localStorage.setItem("dungeon-scrawl-doc-v1", JSON.stringify(doc));
        setLocalLastSaved(Date.now());
        setInternalSyncStatus("synced");
        setTimeout(() => setInternalSyncStatus("idle"), 2000);
        toast.success("Map saved locally");
      } catch (e) {
        setInternalSyncStatus("error");
        toast.error("Local save failed");
      }
      return;
    }

    setBusy(true);
    setInternalSyncStatus("saving");
    try {
      if (current) {
        await updateMap(current.id, { name, doc, thumbnail_url: thumbnail() });
        toast.success("Map saved to the cloud");
      } else {
        const row = await createMap(name, doc, thumbnail());
        setCurrent(row);
        toast.success("Map saved to the cloud");
      }
      setInternalSyncStatus("synced");
      setTimeout(() => setInternalSyncStatus("idle"), 2000);
      refresh();
    } catch (e) {
      setInternalSyncStatus("error");
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
      <Button 
        size="sm" 
        variant="outline" 
        className="h-7 text-xs"
        onClick={onAuthRequired}
      >
        <Cloud className="mr-1 h-3.5 w-3.5" /> Sign in to save
      </Button>
    );
  }


  const statusIndicator = useMemo(() => {
    let content;
    switch (syncStatus) {
      case "saving":
        content = (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Saving to cloud...</span>
          </div>
        );
        break;
      case "synced":
        content = (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>All changes saved</span>
          </div>
        );
        break;
      case "error":
        content = (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">
            <AlertCircle className="h-3 w-3" />
            <span>Sync error</span>
          </div>
        );
        break;
      default:
        content = (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium opacity-60">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            <span>{email ? "Cloud Ready" : "Local Only"}</span>
          </div>
        );
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="cursor-default focus:outline-none hover:bg-muted/50 rounded-full transition-colors">
              {content}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
            <p>{email ? "Cloud synchronization is active" : "Saving maps to browser storage"}</p>
            {localLastSaved && (
              <p className="text-muted-foreground mt-0.5">
                Last saved: {new Date(localLastSaved).toLocaleTimeString()}
              </p>
            )}
            {syncStatus === "saving" && <p className="text-blue-500 animate-pulse mt-0.5">Uploading data...</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, [syncStatus, email, localLastSaved]);


  return (
    <div className="flex items-center gap-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 group">
              {statusIndicator}
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  save();
                }}
                disabled={busy}
              >
                <RefreshCw className={`h-3 w-3 ${busy ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
            <p>Sync now</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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
