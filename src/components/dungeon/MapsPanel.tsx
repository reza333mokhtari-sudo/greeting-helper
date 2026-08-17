import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Map,
  Trash2,
  Edit2,
  Share2,
  MoreVertical,
  Cloud,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dialog } from "@/lib/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listLocalMaps, listCloudMaps } from "@/lib/dungeon/storage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type MapEntry = {
  id: string;
  name: string;
  updated_at?: string;
  lastModified?: number;
  is_public?: boolean;
  isCloud: boolean;
  syncStatus?: "synced" | "pending" | "error";
};

type Props = {
  onLoadMap: (id: string, isCloud: boolean) => void;
  onNewMap: () => void;
  currentMapId?: string;
};

export function MapsPanel({ onLoadMap, onNewMap, currentMapId }: Props) {
  const [maps, setMaps] = useState<MapEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaps = async () => {
    setLoading(true);
    try {
      const [local, cloud] = await Promise.all([
        listLocalMaps().catch(() => []),
        listCloudMaps().catch(() => []),
      ]);

      const combined: MapEntry[] = [
        ...cloud.map((m: any) => ({ ...m, isCloud: true, syncStatus: "synced" })),
        ...local.map((m: any) => ({
          ...m,
          updated_at: new Date(m.lastModified).toISOString(),
          isCloud: false,
          syncStatus: "synced", // Local maps are "synced" to local storage
        })),
      ].sort((a, b) => {
        const dateA = new Date(a.updated_at || 0).getTime();
        const dateB = new Date(b.updated_at || 0).getTime();
        return dateB - dateA;
      });

      setMaps(combined);
    } catch (err) {
      console.error("Failed to fetch maps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const handleDelete = async (id: string, isCloud: boolean) => {
    const ok = await dialog.confirm({
      title: "Delete Map",
      message: `Are you sure you want to delete this ${isCloud ? "cloud" : "local"} map? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      if (isCloud) {
        await supabase.from("maps").delete().eq("id", id);
      } else {
        const localMaps = JSON.parse(localStorage.getItem("dungeon-local-maps") || "{}");
        delete localMaps[id];
        localStorage.setItem("dungeon-local-maps", JSON.stringify(localMaps));
      }
      setMaps((prev) => prev.filter((m) => m.id !== id));
      toast.success("Map deleted");
    } catch (err) {
      toast.error("Failed to delete map");
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Map className="size-4" />
          My Maps
        </h2>
        <Button size="icon" variant="ghost" className="size-8" onClick={onNewMap}>
          <Plus className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading maps...</div>
          ) : maps.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No maps found.</div>
          ) : (
            maps.map((map) => (
              <div
                key={map.id}
                className={`group flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer ${
                  currentMapId === map.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => onLoadMap(map.id, map.isCloud)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <TooltipProvider delayDuration={400}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            {map.isCloud ? (
                              <Cloud className="size-3 text-primary shrink-0" />
                            ) : (
                              <HardDrive className="size-3 text-muted-foreground shrink-0" />
                            )}
                            {map.syncStatus === "synced" && (
                              <CheckCircle2 className="size-2.5 text-green-500 shrink-0" />
                            )}
                            {map.syncStatus === "pending" && (
                              <RefreshCw className="size-2.5 text-blue-500 animate-spin shrink-0" />
                            )}
                            {map.syncStatus === "error" && (
                              <AlertCircle className="size-2.5 text-destructive shrink-0" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-[10px] px-2 py-1">
                          <p className="font-bold">{map.isCloud ? "Cloud Map" : "Local Map"}</p>
                          <p>
                            {map.syncStatus === "synced" ? "All changes synced" : "Sync pending"}
                          </p>
                          {map.updated_at && (
                            <p className="text-muted-foreground mt-1">
                              Last saved: {new Date(map.updated_at).toLocaleString()}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-xs font-medium truncate">
                      {map.name || "Untitled Map"}
                    </span>
                    {map.is_public && (
                      <Badge
                        variant="outline"
                        className="text-[8px] h-3 px-1 border-primary/30 text-primary/70"
                      >
                        Public
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {map.updated_at
                      ? new Date(map.updated_at).toLocaleDateString()
                      : "Unknown date"}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(map.id, map.isCloud);
                      }}
                    >
                      <Trash2 className="size-3 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
