import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Search, Star, Tag, Trash2, Wand2, Palette, Image as ImageIcon, X, Info } from "lucide-react";
import { toast } from "sonner";
import { dialog } from "@/lib/dialog";
import { useVirtualizer } from "@tanstack/react-virtual";

import { supabase } from "@/integrations/supabase/client";
import { deleteAsset, listAssets, updateAsset, uploadAsset, type AssetRow } from "@/lib/cloud";
import { preloadImages } from "@/lib/dungeon/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, ContextMenuLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@/components/ui/context-menu";
import { searchApp, indexAssets } from "@/lib/dungeon/search";

const LIBRARIES = [
  { id: "custom", label: "My Custom Assets", license: "Proprietary / Unknown", searchUrl: "" },
  { id: "opengameart", label: "OpenGameArt", license: "Free / OSS (Check specific asset)", searchUrl: "https://opengameart.org/art-search-advanced?keys=" },
  { id: "icons8", label: "Icons8", license: "Free with Attribution / Commercial", searchUrl: "https://icons8.com/icons/set/" },
  { id: "flaticon", label: "Flaticon", license: "Free with Attribution / Premium", searchUrl: "https://www.flaticon.com/search?word=" },
  { id: "noun", label: "Noun Project", license: "CC BY / Public Domain", searchUrl: "https://thenounproject.com/search/icons/?q=" },
  { id: "kenney", label: "Kenney", license: "CC0 (Public Domain)", searchUrl: "https://www.kenney.nl/assets?q=" },
];

export function PropsPanel({ onPlace, onPreview }: { onPlace: (url: string, name: string) => void, onPreview?: (prop: { id: string; url: string; name: string; license?: string | null }) => void }) {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState("custom");
  const [searchOpen, setSearchOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    listAssets()
      .then((rows) => {
        setAssets(rows);
        preloadImages(rows.map((r) => r.url));
      })
      .catch((err) => {
        console.error("Failed to load assets", err);
      });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (signedIn) refresh();
    else setAssets([]);
  }, [signedIn, refresh]);

  /** Bulk upload: sequential with a live progress bar and per-file error reporting. */
  const upload = useCallback(
    async (files: File[]) => {
      const lib = LIBRARIES.find(l => l.id === selectedLibrary);
      const license = lib?.license;
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;
      setProgress({ done: 0, total: images.length });
      let failed = 0;
      for (let i = 0; i < images.length; i++) {
        try {
          await uploadAsset(images[i]!, "prop", license);
        } catch {
          failed++;
        }
        setProgress({ done: i + 1, total: images.length });
      }
      setProgress(null);
      refresh();
      if (failed) toast.error(`${failed} of ${images.length} uploads failed`);
      else toast.success(`Uploaded ${images.length} file${images.length > 1 ? "s" : ""}`);
    },
    [refresh],
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => a.tags?.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [assets]);

  const visible = useMemo(() => {
    const q = query.trim();
    if (q) {
      const results = searchApp(q);
      const ids = new Set(results.filter(r => r['type'] === 'prop').map(r => r.id.replace('prop-', '')));
      return assets.filter(a => ids.has(a.id));
    }

    return assets
      .filter((a) => (favOnly ? a.favorite : true))
      .filter((a) => (tagFilter ? a.tags?.includes(tagFilter) : true))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }, [assets, query, favOnly, tagFilter]);

  useEffect(() => {
    if (assets.length) indexAssets(assets);
  }, [assets]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(visible.length / 3);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90,
    overscan: 5,
  });

  const editTags = async (a: AssetRow) => {
    const next = await dialog.prompt(`Tags for "${a.name}"`, (a.tags ?? []).join(", "), "Enter tags separated by commas");
    if (next === null) return;
    const tags = next
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);
    await updateAsset(a.id, { tags });
    refresh();
  };

  const toggleFav = async (a: AssetRow) => {
    setAssets((rows) => rows.map((r) => (r.id === a.id ? { ...r, favorite: !r.favorite } : r)));
    await updateAsset(a.id, { favorite: !a.favorite }).catch(() => refresh());
  };

  return (
    <section
      className={`space-y-2 rounded-lg ${dragOver ? "outline outline-2 outline-primary/70" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!signedIn) return;
        upload(Array.from(e.dataTransfer.files));
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{selectedLibrary === "custom" ? "My Props & Textures" : "Props & Textures"}</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
            <SelectTrigger className="h-6 w-[130px] text-[10px]">
              <SelectValue placeholder="Library" />
            </SelectTrigger>
            <SelectContent>
              {LIBRARIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="text-[10px]">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-[10px]"
              disabled={!signedIn || !!progress}
              onClick={() => fileRef.current?.click()}
              title="Upload from device"
            >
              <ImagePlus className="mr-1 h-3 w-3" /> Upload
            </Button>
            {selectedLibrary !== "custom" && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[10px] border-primary/30 hover:border-primary/60"
                onClick={() => {
                  const lib = LIBRARIES.find(l => l.id === selectedLibrary);
                  if (lib?.searchUrl) {
                    const q = query.trim() || "dungeon props";
                    window.open(`${lib.searchUrl}${encodeURIComponent(q)}`, "_blank");
                    setSearchOpen(true);
                  }
                }}
              >
                <Search className="mr-1 h-3 w-3" /> Browse Icons Library
              </Button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          upload(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {!signedIn ? (
        <div className="space-y-4">
          <p className="text-[11px] text-muted-foreground">Sign in to upload and manage your own custom props and textures.</p>
          <div className="rounded-md border border-border/50 bg-muted/20 p-2 text-[10px] space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Star className="h-3 w-3 text-accent fill-current" /> Recommended Icon Libraries
            </p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">OpenGameArt</span> — Free/OSS. Massive assets (pixel, vector, hand-drawn). Best for RPGs.
              </li>
              <li>
                <span className="text-foreground font-medium">Icons8</span> — 150k+ icons. Flat, lineal, filled. Great for movie/media/games. (Attribution required).
              </li>
              <li>
                <span className="text-foreground font-medium">Flaticon</span> — Largest vector collection. Excellent Entertainment/Genre categories.
              </li>
              <li>
                <span className="text-foreground font-medium">Noun Project</span> — High-quality vectors for any subject (film reels, consoles).
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {progress && (
            <div className="space-y-1">
              <Progress value={(progress.done / progress.total) * 100} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground">
                Uploading {progress.done}/{progress.total}…
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    e.currentTarget.blur();
                  }
                }}
                placeholder={selectedLibrary === "custom" ? "Search your library..." : "Search icons..."}
                className="h-8 pl-8 pr-8 text-[11px] bg-background/50 focus-visible:ring-accent/30"
              />
              {query && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0.5 top-0.5 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={favOnly ? "default" : "outline"}
                    className="size-8 shrink-0"
                    onClick={() => setFavOnly((v) => !v)}
                  >
                    <Star className={`h-3.5 w-3.5 ${favOnly ? "fill-current" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Show favorites only</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags.map((t) => (
                <Badge
                  key={t}
                  variant={tagFilter === t ? "default" : "outline"}
                  className="cursor-pointer text-[9px]"
                  onClick={() => setTagFilter((cur) => (cur === t ? null : t))}
                >
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              {assets.length ? "No props match that search." : "Drop images here or upload PNGs, tokens and textures."}
            </p>
          ) : (
            <ScrollArea viewportRef={parentRef} className="h-[400px]">
              <div 
                className="relative w-full" 
                style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const start = virtualRow.index * 3;
                  const rowAssets = visible.slice(start, start + 3);
                  
                  return (
                    <div 
                      key={virtualRow.key}
                      className="absolute left-0 top-0 w-full grid grid-cols-3 gap-2"
                      style={{ 
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                    >
                      {rowAssets.map((a) => (
                        <div key={a.id} className="group relative overflow-hidden rounded-md border border-border/60 bg-card/60 h-[80px]">
                          <ContextMenu>
                            <ContextMenuTrigger>
                              <button 
                                type="button" 
                                className="block w-full" 
                                title={`Preview ${a.name}`} 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onPreview?.(a);
                                }}
                              >
                                <img src={a.url} alt={a.name} className="h-14 w-full object-contain p-1" />
                              </button>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48">
                              <ContextMenuLabel className="text-[10px] uppercase tracking-wider">{a.name}</ContextMenuLabel>
                              <ContextMenuSeparator />
                              <ContextMenuItem onClick={() => onPlace(a.url, a.name)}>
                                Place on Map
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => toggleFav(a)}>
                                <Star className={`mr-2 size-3.5 ${a.favorite ? "fill-current" : ""}`} /> 
                                {a.favorite ? "Unfavorite" : "Favorite"}
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => editTags(a)}>
                                <Tag className="mr-2 size-3.5" /> Edit Tags
                              </ContextMenuItem>
                              <ContextMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={async () => {
                                  if (await dialog.confirm({
                                    title: "Delete Prop",
                                    message: `Delete "${a.name}"? This cannot be undone.`,
                                    confirmText: "Delete",
                                    variant: "danger"
                                  })) {
                                    await deleteAsset(a.id);
                                    refresh();
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 size-3.5" /> Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                          <div className="flex items-center justify-between px-1 pb-0.5">
                            <span className="block truncate text-[9px] text-muted-foreground">{a.name}</span>
                          </div>
                          {a.favorite && (
                            <Star className="absolute left-0.5 top-0.5 h-3 w-3 fill-current text-accent" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </>
      )}

      {searchOpen && (
        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-[11px] space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Icon Import Workflow
            </p>
            <Button variant="ghost" size="icon" className="size-5 -mr-1" onClick={() => setSearchOpen(false)}>
              <span className="sr-only">Close</span>
              <Trash2 className="size-3" />
            </Button>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            I've opened the <strong>{LIBRARIES.find(l => l.id === selectedLibrary)?.label}</strong> search for you. 
            Found an icon? 
          </p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground pl-1">
            <li>Right-click the icon and <span className="text-foreground font-medium underline decoration-primary/30">Copy Image Link</span></li>
            <li>Paste the URL below to import it into your map layer</li>
          </ol>
          <div className="flex gap-2 pt-1">
            <Input 
              placeholder="Paste image URL (png/svg/webp)..." 
              className="h-8 text-[10px]"
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  const url = e.currentTarget.value.trim();
                  if (url) {
                    try {
                      new URL(url); // basic validation
                      onPlace(url, "Imported Icon");
                      toast.success("Icon imported to active layer");
                      e.currentTarget.value = "";
                    } catch {
                      toast.error("Please enter a valid image URL");
                    }
                  }
                }
              }}
            />
            <Button 
              size="sm" 
              className="h-8 text-[10px]" 
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const url = input.value.trim();
                if (url) {
                  onPlace(url, "Imported Icon");
                  toast.success("Icon imported to active layer");
                  input.value = "";
                }
              }}
            >
              Import
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground italic">
            Note: License tracker will automatically apply the <strong>{LIBRARIES.find(l => l.id === selectedLibrary)?.license}</strong> license to this import.
          </p>
        </div>
      )}
    </section>
  );
}
