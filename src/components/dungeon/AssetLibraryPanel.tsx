import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Plus,
  Import,
  Globe,
  HardDrive,
  LayoutGrid,
  List,
  Check,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
  src: string;
  tags: string[];
  size: { w: number; h: number };
  variants?: string[];
}

interface AssetManifest {
  id: string;
  name: string;
  version: string;
  categories: string[];
  assets: Asset[];
}

export function AssetLibraryPanel({ onPlace }: { onPlace: (url: string, name: string) => void }) {
  const [manifest, setManifest] = useState<AssetManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/assets/soulslike/manifest.json")
      .then((res) => res.json())
      .then((data) => {
        setManifest(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load soulslike manifest", err);
        setLoading(false);
      });
  }, []);

  const filteredAssets = useMemo(() => {
    if (!manifest) return [];
    return manifest.assets.filter((a) => {
      const matchesQuery =
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = activeCategory === "all" || a.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [manifest, query, activeCategory]);

  const handleImport = async () => {
    const url = await window.prompt("Enter manifest URL (GitHub Raw supported):");
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.assets && data.id) {
        setManifest(data);
        toast.success(`Loaded pack: ${data.name}`);
      } else {
        toast.error("Invalid manifest structure");
      }
    } catch (err) {
      toast.error("Failed to load manifest from URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Package className="size-3 text-primary" />
          Asset Library
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleImport}
            title="Import Pack"
          >
            <Import className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search soulslike assets..."
            className="h-8 pl-8 text-[11px] bg-background/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-1">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => setActiveCategory("all")}
            >
              All
            </Button>
            {manifest?.categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-[10px] capitalize"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Search className="size-8 opacity-20 mb-2" />
            <p className="text-[11px]">No assets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 pb-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative flex flex-col items-center justify-center p-2 rounded-md border border-border/60 bg-card/40 hover:bg-accent/10 transition-colors cursor-pointer"
                onClick={() => onPlace(asset.src, asset.name)}
                title={asset.name}
              >
                <div className="h-12 w-full flex items-center justify-center">
                  <img
                    src={asset.src}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="mt-1 w-full text-[9px] text-muted-foreground truncate text-center">
                  {asset.name}
                </span>
                {asset.variants && (
                  <div
                    className="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary/40"
                    title="Has variants"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </section>
  );
}
