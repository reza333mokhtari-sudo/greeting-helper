import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Search, Star, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { deleteAsset, listAssets, updateAsset, uploadAsset, type AssetRow } from "@/lib/cloud";
import { preloadImages } from "@/lib/dungeon/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function PropsPanel({ onPlace }: { onPlace: (url: string, name: string) => void }) {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    listAssets()
      .then((rows) => {
        setAssets(rows);
        preloadImages(rows.map((r) => r.url));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (signedIn) refresh();
    else setAssets([]);
  }, [signedIn, refresh]);

  /** Bulk upload: sequential with a live progress bar and per-file error reporting. */
  const upload = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;
      setProgress({ done: 0, total: images.length });
      let failed = 0;
      for (let i = 0; i < images.length; i++) {
        try {
          await uploadAsset(images[i]!);
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
    const q = query.trim().toLowerCase();
    return assets
      .filter((a) => (favOnly ? a.favorite : true))
      .filter((a) => (tagFilter ? a.tags?.includes(tagFilter) : true))
      .filter((a) => (q ? a.name.toLowerCase().includes(q) || a.tags?.some((t) => t.toLowerCase().includes(q)) : true))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }, [assets, favOnly, query, tagFilter]);

  const editTags = async (a: AssetRow) => {
    const next = window.prompt(`Tags for "${a.name}" (comma separated)`, (a.tags ?? []).join(", "));
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
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Props &amp; textures</h2>
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-[10px]"
          disabled={!signedIn || !!progress}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="mr-1 h-3 w-3" /> Upload
        </Button>
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
        <p className="text-[11px] text-muted-foreground">Sign in to upload your own props and textures.</p>
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

          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search props…"
                className="h-7 pl-7 text-[11px]"
              />
            </div>
            <Button
              size="icon"
              variant={favOnly ? "default" : "outline"}
              className="size-7"
              aria-label="Show favourites only"
              aria-pressed={favOnly}
              onClick={() => setFavOnly((v) => !v)}
            >
              <Star className={`h-3 w-3 ${favOnly ? "fill-current" : ""}`} />
            </Button>
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
            <div className="grid grid-cols-3 gap-2">
              {visible.map((a) => (
                <div key={a.id} className="group relative overflow-hidden rounded-md border border-border/60 bg-card/60">
                  <button type="button" className="block w-full" title={`Place ${a.name}`} onClick={() => onPlace(a.url, a.name)}>
                    <img src={a.url} alt={a.name} className="h-14 w-full object-contain p-1" />
                  </button>
                  <span className="block truncate px-1 pb-0.5 text-[9px] text-muted-foreground">{a.name}</span>
                  <div className="absolute right-0.5 top-0.5 hidden flex-col gap-0.5 group-hover:flex">
                    <button
                      type="button"
                      aria-label="Toggle favourite"
                      className="rounded bg-background/85 p-0.5 text-accent"
                      onClick={() => toggleFav(a)}
                    >
                      <Star className={`h-3 w-3 ${a.favorite ? "fill-current" : ""}`} />
                    </button>
                    <button type="button" aria-label="Edit tags" className="rounded bg-background/85 p-0.5" onClick={() => editTags(a)}>
                      <Tag className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete prop"
                      className="rounded bg-background/85 p-0.5 text-destructive"
                      onClick={async () => {
                        await deleteAsset(a.id);
                        refresh();
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {a.favorite && (
                    <Star className="absolute left-0.5 top-0.5 h-3 w-3 fill-current text-accent group-hover:hidden" />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
