import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { deleteAsset, listAssets, uploadAsset, type AssetRow } from "@/lib/cloud";
import { preloadImages } from "@/lib/dungeon/assets";
import { Button } from "@/components/ui/button";

export function PropsPanel({ onPlace }: { onPlace: (url: string, name: string) => void }) {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
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

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) await uploadAsset(f);
      refresh();
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
    setBusy(false);
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Props & textures</h2>
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-[10px]"
          disabled={!signedIn || busy}
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
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      {!signedIn ? (
        <p className="text-[11px] text-muted-foreground">Sign in to upload your own props and textures.</p>
      ) : assets.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No props yet — upload PNGs, tokens or textures.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {assets.map((a) => (
            <div key={a.id} className="group relative overflow-hidden rounded-md border border-border/60 bg-card/60">
              <button type="button" className="block w-full" title={`Place ${a.name}`} onClick={() => onPlace(a.url, a.name)}>
                <img src={a.url} alt={a.name} className="h-14 w-full object-contain p-1" />
              </button>
              <button
                type="button"
                aria-label="Delete prop"
                className="absolute right-0.5 top-0.5 hidden rounded bg-background/80 p-0.5 text-destructive group-hover:block"
                onClick={async () => {
                  await deleteAsset(a.id);
                  refresh();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
