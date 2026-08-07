import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Map, Trash2, Edit2, Share2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dialog } from "@/lib/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


type MapEntry = {
  id: string;
  name: string;
  updated_at: string;
  is_public: boolean;
};

type Props = {
  onLoadMap: (id: string) => void;
  onNewMap: () => void;
  currentMapId?: string;
};

export function MapsPanel({ onLoadMap, onNewMap, currentMapId }: Props) {
  const [maps, setMaps] = useState<MapEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, we'd fetch from Supabase. 
  // For now, we'll use a mix of local storage "cloud" simulation and Supabase if available.
  useEffect(() => {
    async function fetchMaps() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data, error } = await supabase
            .from('dungeon_maps' as any)
            .select('id, name, updated_at, is_public')
            .order('updated_at', { ascending: false });

          if (error) throw error;
          setMaps((data as any) || []);
        } else {
          // Fallback to local storage list if not logged in
          const localMaps = JSON.parse(localStorage.getItem('dungeon-scrawl-maps-list') || '[]');
          setMaps(localMaps);
        }
      } catch (err) {
        console.error("Failed to fetch maps:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMaps();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await dialog.confirm({
      title: "Delete Map",
      message: "Are you sure you want to delete this map? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger"
    });
    if (!ok) return;

    try {
      setMaps(prev => prev.filter(m => m.id !== id));
      toast.success("Map deleted");
    } catch (err) {
      toast.error("Failed to delete map");
    }
  };

  const handleRename = async (id: string, oldName: string) => {
    const newName = await dialog.prompt("Rename Map", oldName, "Enter new name:");
    if (!newName || newName === oldName) return;

    setMaps(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
    toast.success("Map renamed");
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
            <div className="p-4 text-center text-xs text-muted-foreground">No maps found. Create your first one!</div>
          ) : (
            maps.map((map) => (
              <div
                key={map.id}
                className={`group flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer ${
                  currentMapId === map.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                }`}
                onClick={() => onLoadMap(map.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{map.name || "Untitled Map"}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(map.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRename(map.id, map.name); }}>
                      <Edit2 className="size-3 mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                      <Share2 className="size-3 mr-2" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(map.id); }}
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
