import type { Doc, Layer, MapObject } from "@/lib/dungeon/model";

type Props = {
  doc: Doc;
  activeLayer: string;
  onActiveLayer: (id: string) => void;
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void;
  onMoveLayer: (id: string, dir: -1 | 1) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  selected: string[];
  onSelect: (ids: string[]) => void;
};

function countOn(objects: MapObject[], id: string) {
  return objects.filter((o) => o.layerId === id).length;
}

export function LayersPanel(p: Props) {
  const layers = [...p.doc.layers].reverse(); // top layer first in UI

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Layers</h2>
        <button onClick={p.onAddLayer} className="rounded border border-border px-1.5 text-xs hover:bg-accent" title="Add layer">
          +
        </button>
      </div>
      <ul className="flex flex-col gap-1">
        {layers.map((l) => {
          const objs = p.doc.objects.filter((o) => o.layerId === l.id);
          const active = p.activeLayer === l.id;
          return (
            <li
              key={l.id}
              className={`rounded border px-2 py-1.5 text-xs ${active ? "border-primary/60 bg-accent" : "border-border"}`}
            >
              <div className="flex items-center gap-1.5">
                <button
                  title={l.visible ? "Hide layer" : "Show layer"}
                  onClick={() => p.onUpdateLayer(l.id, { visible: !l.visible })}
                  className="text-sm leading-none opacity-80 hover:opacity-100"
                >
                  {l.visible ? "◉" : "○"}
                </button>
                <button
                  title={l.locked ? "Unlock layer" : "Lock layer"}
                  onClick={() => p.onUpdateLayer(l.id, { locked: !l.locked })}
                  className="text-[11px] leading-none opacity-80 hover:opacity-100"
                >
                  {l.locked ? "🔒" : "🔓"}
                </button>
                <input
                  value={l.name}
                  onChange={(e) => p.onUpdateLayer(l.id, { name: e.target.value })}
                  onFocus={() => p.onActiveLayer(l.id)}
                  className="min-w-0 flex-1 bg-transparent outline-none"
                />
                <span className="tabular-nums text-[10px] text-muted-foreground">{countOn(p.doc.objects, l.id)}</span>
                <button onClick={() => p.onMoveLayer(l.id, 1)} title="Move up" className="px-1 hover:bg-accent">
                  ↑
                </button>
                <button onClick={() => p.onMoveLayer(l.id, -1)} title="Move down" className="px-1 hover:bg-accent">
                  ↓
                </button>
                <button onClick={() => p.onDeleteLayer(l.id)} title="Delete layer" className="px-1 text-destructive hover:bg-destructive/10">
                  ×
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => p.onActiveLayer(l.id)}
                  className={`rounded px-1.5 py-0.5 text-[10px] ${active ? "bg-primary text-primary-foreground" : "border border-border"}`}
                >
                  {active ? "Active" : "Set active"}
                </button>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(l.opacity * 100)}
                  onChange={(e) => p.onUpdateLayer(l.id, { opacity: Number(e.target.value) / 100 })}
                  className="h-1 flex-1 accent-primary"
                  title="Layer opacity"
                />
              </div>
              {active && objs.length > 0 && (
                <ul className="mt-1 max-h-28 overflow-y-auto">
                  {objs.map((o) => (
                    <li key={o.id}>
                      <button
                        onClick={() => p.onSelect([o.id])}
                        className={`w-full truncate rounded px-1 py-0.5 text-left text-[11px] ${
                          p.selected.includes(o.id) ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {o.kind} · {o.name || ("label" in o && o.label) || ("text" in o && o.text) || o.id.slice(-4)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
