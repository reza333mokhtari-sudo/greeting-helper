import { useEffect, useRef, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";

import { getSharedMap } from "@/lib/sharedmap.functions";
import { migrateDoc, docBounds, type Doc } from "@/lib/dungeon/model";
import { renderScene } from "@/lib/dungeon/render";
import { onImageLoaded } from "@/lib/dungeon/assets";

export const Route = createFileRoute("/m/$slug")({
  loader: async ({ params }) => getSharedMap({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const title = loaderData?.name ? `${loaderData.name} — Shared dungeon map` : "Shared dungeon map";
    return {
      meta: [
        { title },
        { name: "description", content: "A player-ready dungeon map shared from the Dungeon Scrawl map maker." },
        { property: "og:title", content: title },
        { property: "og:description", content: "A player-ready dungeon map shared from the Dungeon Scrawl map maker." },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Centered>Could not load this map.</Centered>,
  notFoundComponent: () => <Centered>Map not found.</Centered>,
  component: SharedMap,
});

function Centered(p: { children: React.ReactNode }) {
  return <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">{p.children}</div>;
}

function SharedMap() {
  const data = Route.useLoaderData();
  if (!data) return <Centered>This map is not shared publicly.</Centered>;
  const doc = migrateDoc(JSON.parse(data.docJson));
  return (
    <main className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <h1 className="text-sm font-semibold text-arcane">{data.name}</h1>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Player view</span>
      </header>
      <ClientOnly fallback={<Centered>Rendering…</Centered>}>
        <Viewer doc={doc} />
      </ClientOnly>
    </main>
  );
}

function Viewer({ doc }: { doc: Doc }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => onImageLoaded(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const b = docBounds(doc) ?? { x1: 0, y1: 0, x2: 800, y2: 600 };
      const pad = 40;
      const scale = Math.min((w - pad * 2) / Math.max(1, b.x2 - b.x1), (h - pad * 2) / Math.max(1, b.y2 - b.y1), 2);
      const view = {
        x: w / 2 - ((b.x1 + b.x2) / 2) * scale,
        y: h / 2 - ((b.y1 + b.y2) / 2) * scale,
        scale,
      };
      renderScene(ctx, { ...doc, settings: { ...doc.settings, playerView: true } }, view, w, h, { hideUi: true, dpr });
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [doc, tick]);

  return <canvas ref={ref} className="min-h-0 flex-1" />;
}
