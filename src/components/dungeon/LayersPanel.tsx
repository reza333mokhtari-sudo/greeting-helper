import { useState } from "react";
import type { Doc, Layer, MapObject } from "@/lib/dungeon/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Lock, LockOpen, ChevronUp, ChevronDown, X, Plus, GripVertical } from "lucide-react";

type Props = {
  doc: Doc;
  activeLayer: string;
  onActiveLayer: (id: string) => void;
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void;
  onMoveLayer: (id: string, dir: -1 | 1) => void;
  onReorderLayer: (id: string, targetId: string, place: "above" | "below") => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  selected: string[];
  onSelect: (ids: string[]) => void;
};

function countOn(objects: MapObject[], id: string) {
  return objects.filter((o) => o.layerId === id).length;
}

function Hint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}

export function LayersPanel(p: Props) {
  const layers = [...p.doc.layers].reverse();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPlace, setOverPlace] = useState<"above" | "below">("above");

  return (
    <TooltipProvider delayDuration={250}>
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Layers
        </h2>
        <Hint label="Add layer">
          <Button variant="ghost" size="icon" className="size-6" onClick={p.onAddLayer} aria-label="Add layer">
            <Plus className="size-3.5" />
          </Button>
        </Hint>
      </div>

      <ul className="flex flex-col gap-1.5">
        {layers.map((l) => {
          const objs = p.doc.objects.filter((o) => o.layerId === l.id);
          const active = p.activeLayer === l.id;
          const isOver = overId === l.id && dragId !== null && dragId !== l.id;
          return (
            <li
              key={l.id}
              draggable
              onDragStart={(e) => {
                setDragId(l.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", l.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDragOver={(e) => {
                if (!dragId || dragId === l.id) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                const r = e.currentTarget.getBoundingClientRect();
                setOverId(l.id);
                setOverPlace(e.clientY < r.top + r.height / 2 ? "above" : "below");
              }}
              onDragLeave={() => setOverId((cur) => (cur === l.id ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                const id = dragId ?? e.dataTransfer.getData("text/plain");
                if (id && id !== l.id) p.onReorderLayer(id, l.id, overPlace);
                setDragId(null);
                setOverId(null);
              }}
              onClick={() => p.onActiveLayer(l.id)}
              className={`cursor-pointer rounded-lg border px-2 py-1.5 transition-colors ${
                dragId === l.id ? "opacity-50" : ""
              } ${
                isOver
                  ? overPlace === "above"
                    ? "border-t-2 border-t-primary"
                    : "border-b-2 border-b-primary"
                  : ""
              } ${
                active ? "border-primary/60 bg-accent/60 shadow-[var(--shadow-arcane)]" : "border-border bg-card/40 hover:bg-accent/30"
              }`}
            >

              <div className="flex items-center gap-1">
                <span
                  className="cursor-grab text-muted-foreground/60 active:cursor-grabbing"
                  aria-hidden
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="size-3.5" />
                </span>
                <Hint label={l.visible ? "Hide layer" : "Show layer"}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground"
                    aria-label={l.visible ? "Hide layer" : "Show layer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      p.onUpdateLayer(l.id, { visible: !l.visible });
                    }}
                  >
                    {l.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </Button>
                </Hint>
                <Hint label={l.locked ? "Unlock layer" : "Lock layer"}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground"
                    aria-label={l.locked ? "Unlock layer" : "Lock layer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      p.onUpdateLayer(l.id, { locked: !l.locked });
                    }}
                  >
                    {l.locked ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
                  </Button>
                </Hint>

                <Input
                  value={l.name}
                  onChange={(e) => p.onUpdateLayer(l.id, { name: e.target.value })}
                  onFocus={() => p.onActiveLayer(l.id)}
                  className="h-6 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-1"
                />
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] tabular-nums">
                  {countOn(p.doc.objects, l.id)}
                </Badge>
              </div>

              <div className="mt-1 flex items-center gap-1">
                <Slider
                  value={[Math.round(l.opacity * 100)]}
                  min={10}
                  max={100}
                  onValueChange={([v]) => p.onUpdateLayer(l.id, { opacity: (v ?? 100) / 100 })}
                  onClick={(e) => e.stopPropagation()}
                  className="mx-1 flex-1"
                  aria-label="Layer opacity"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  aria-label="Move layer up"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onMoveLayer(l.id, 1);
                  }}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  aria-label="Move layer down"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onMoveLayer(l.id, -1);
                  }}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete layer"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onDeleteLayer(l.id);
                  }}
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              {active && objs.length > 0 && (
                <ScrollArea className="mt-1 max-h-28">
                  <ul className="pr-2">
                    {objs.map((o) => (
                      <li key={o.id}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            p.onSelect([o.id]);
                          }}
                          className={`w-full truncate rounded px-1 py-0.5 text-left text-[11px] ${
                            p.selected.includes(o.id)
                              ? "bg-primary/25 text-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {o.kind} · {o.name || ("label" in o && o.label) || ("text" in o && o.text) || o.id.slice(-4)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </li>
          );
        })}
      </ul>
    </section>
    </TooltipProvider>
  );
}
