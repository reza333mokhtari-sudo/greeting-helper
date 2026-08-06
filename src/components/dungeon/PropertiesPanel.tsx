import type { Doc, MapObject, TriggerKind } from "@/lib/dungeon/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Trash2, Crown, Maximize2, Upload, Box, Image as ImageIcon } from "lucide-react";

type Props = {
  doc: Doc;
  object: MapObject | null;
  onChange: (id: string, patch: Partial<MapObject>) => void;
  onDelete: (id: string) => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <Label className="shrink-0 text-xs font-normal text-muted-foreground">{label}</Label>
      <div className="flex min-w-0 items-center gap-2">{children}</div>
    </div>
  );
}

function NumSlider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <>
      <Slider value={[value]} min={min} max={max} onValueChange={([v]) => onChange(v ?? value)} className="w-24" />
      <span className="w-8 text-right text-xs tabular-nums text-foreground/80">{Math.round(value)}</span>
    </>
  );
}

function Color({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Colour"
      className="h-7 w-11 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
    />
  );
}

const numInput = "h-7 w-32 text-xs";

export function PropertiesPanel({ doc, object: o, onChange, onDelete }: Props) {
  if (!o) {
    return (
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
          Properties
        </h2>
        <div className="rounded-xl border border-dashed border-border p-4 text-center">
          <p className="text-[10px] italic leading-relaxed text-muted-foreground">
            Select an object or tool to tweak its specific settings.
          </p>
        </div>
      </section>
    );
  }

  const patch = (v: Partial<MapObject>) => onChange(o.id, v);
  const props = o.props ?? [];
  const setProp = (i: number, key: string, value: string) =>
    patch({ props: props.map((p, j) => (j === i ? { key, value } : p)) } as Partial<MapObject>);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
          Properties
          <Badge variant="outline" className="h-4 border-primary/20 bg-primary/5 px-1.5 text-[9px] uppercase tracking-wider text-primary">
            {o.kind}
          </Badge>
        </h2>
        <div className="flex items-center gap-1">
          {(o as any).pro && (
            <Badge variant="secondary" className="h-4 gap-1 px-1.5 text-[8px] font-bold uppercase tracking-wider text-primary bg-primary/10 border-none">
              <Crown className="size-2" /> Pro
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete object"
            onClick={() => onDelete(o.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <Row label="Name">
        <Input
          className={numInput}
          value={o.name ?? ""}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Unnamed"
        />
      </Row>
      <Row label="Layer">
        <Select value={o.layerId} onValueChange={(v) => patch({ layerId: v })}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {doc.layers.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <Row label="X">
        <Input type="number" className={numInput} value={Math.round(o.x)} onChange={(e) => patch({ x: Number(e.target.value) })} />
      </Row>
      <Row label="Y">
        <Input type="number" className={numInput} value={Math.round(o.y)} onChange={(e) => patch({ y: Number(e.target.value) })} />
      </Row>

      {o.kind === "image" && (
        <>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Box className="size-3" />
              Source & Texture
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full justify-start text-[10px] bg-background"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      patch({ url } as Partial<MapObject>);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="mr-2 size-3" />
                Upload Image
              </Button>

              <div 
                className="group relative flex h-24 w-full cursor-default items-center justify-center rounded-md border border-dashed border-primary/30 bg-background/50 transition-colors hover:bg-primary/5"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-primary/10", "border-primary");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("bg-primary/10", "border-primary");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("bg-primary/10", "border-primary");
                  
                  // Handle file drop
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    const url = URL.createObjectURL(file);
                    patch({ url } as Partial<MapObject>);
                    return;
                  }

                  // Handle props/texture panel drop (using URL from dataTransfer)
                  const url = e.dataTransfer.getData("text/plain");
                  if (url && (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("/"))) {
                    patch({ url } as Partial<MapObject>);
                  }
                }}
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto size-6 text-muted-foreground/40" />
                  <p className="mt-1 text-[9px] text-muted-foreground">Drop Image here</p>
                  <p className="text-[8px] text-muted-foreground/60">from PC or Props Panel</p>
                </div>
              </div>
            </div>

            <Row label="Visual Filter">
              <Select value={o.filter ?? "none"} onValueChange={(v) => patch({ filter: v as any })}>
                <SelectTrigger className="h-7 w-full text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Filter</SelectItem>
                  <SelectItem value="pixel">Pixel Graphics</SelectItem>
                  <SelectItem value="toon">Toon Style</SelectItem>
                  <SelectItem value="remove-bg">Remove Background</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </div>

          <div className="space-y-1">
            <Row label="Width">
              <NumSlider value={o.w} min={8} max={2000} onChange={(v) => patch({ w: v } as Partial<MapObject>)} />
            </Row>
            <Row label="Height">
              <NumSlider value={o.h} min={8} max={2000} onChange={(v) => patch({ h: v } as Partial<MapObject>)} />
            </Row>
            <Row label="Rotation°">
              <Input
                type="number"
                className={numInput}
                value={Math.round((o.angle * 180) / Math.PI)}
                onChange={(e) => patch({ angle: (Number(e.target.value) * Math.PI) / 180 } as Partial<MapObject>)}
              />
            </Row>
            <div className="flex gap-2 py-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => (onChange as any)(o.id, { preview: true })}
              >
                <Maximize2 className="mr-2 size-3" /> View Fullscreen
              </Button>
            </div>
          </div>
        </>
      )}
      {(o.kind === "door" || o.kind === "stairs") && (
        <Row label="Rotation°">
          <Input
            type="number"
            className={numInput}
            value={Math.round((o.angle * 180) / Math.PI)}
            onChange={(e) => patch({ angle: (Number(e.target.value) * Math.PI) / 180 } as Partial<MapObject>)}
          />
        </Row>
      )}
      {o.kind === "door" && (
        <>
          <Row label="Variant">
            <Select value={o.variant} onValueChange={(v) => patch({ variant: v } as Partial<MapObject>)}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="door">Door</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="secret">Secret</SelectItem>
                <SelectItem value="archway">Archway</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Blocks light">
            <Switch
              checked={!!o.blocksLight}
              onCheckedChange={(v) => patch({ blocksLight: v } as Partial<MapObject>)}
            />
          </Row>
        </>
      )}
      {o.kind === "npc" && (
        <>
          <Row label="Label">
            <Input className={numInput} value={o.label} onChange={(e) => patch({ label: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Token size">
            <NumSlider value={o.r} min={6} max={64} onChange={(v) => patch({ r: v } as Partial<MapObject>)} />
          </Row>
          <Row label="Colour">
            <Color value={o.color} onChange={(v) => patch({ color: v } as Partial<MapObject>)} />
          </Row>
          <Row label="Hostile">
            <Switch checked={o.hostile} onCheckedChange={(v) => patch({ hostile: v } as Partial<MapObject>)} />
          </Row>
        </>
      )}
      {o.kind === "item" && (
        <>
          <Row label="Label">
            <Input className={numInput} value={o.label} onChange={(e) => patch({ label: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Size">
            <NumSlider value={o.size} min={8} max={64} onChange={(v) => patch({ size: v } as Partial<MapObject>)} />
          </Row>
          <Row label="Colour">
            <Color value={o.color} onChange={(v) => patch({ color: v } as Partial<MapObject>)} />
          </Row>
        </>
      )}
      {o.kind === "trigger" && (
        <>
          <Row label="Label">
            <Input className={numInput} value={o.label} onChange={(e) => patch({ label: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Type">
            <Select value={o.trigger} onValueChange={(v) => patch({ trigger: v as TriggerKind } as Partial<MapObject>)}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trap">Trap</SelectItem>
                <SelectItem value="encounter">Encounter</SelectItem>
                <SelectItem value="script">Script</SelectItem>
                <SelectItem value="portal">Portal</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Width">
            <Input type="number" className={numInput} value={Math.round(o.w)} onChange={(e) => patch({ w: Number(e.target.value) } as Partial<MapObject>)} />
          </Row>
          <Row label="Height">
            <Input type="number" className={numInput} value={Math.round(o.h)} onChange={(e) => patch({ h: Number(e.target.value) } as Partial<MapObject>)} />
          </Row>
          <Row label="Colour">
            <Color value={o.color} onChange={(v) => patch({ color: v } as Partial<MapObject>)} />
          </Row>
        </>
      )}
      {o.kind === "light" && (
        <>
          <Row label="Radius">
            <NumSlider value={o.radius} min={20} max={800} onChange={(v) => patch({ radius: v } as Partial<MapObject>)} />
          </Row>
          <Row label="Intensity">
            <NumSlider
              value={Math.round(o.intensity * 100)}
              min={5}
              max={100}
              onChange={(v) => patch({ intensity: v / 100 } as Partial<MapObject>)}
            />
          </Row>
          <Row label="Colour">
            <Color value={o.color} onChange={(v) => patch({ color: v } as Partial<MapObject>)} />
          </Row>
        </>
      )}
      {o.kind === "text" && (
        <>
          <Row label="Text">
            <Input className={numInput} value={o.text} onChange={(e) => patch({ text: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Font size">
            <NumSlider value={o.size} min={8} max={96} onChange={(v) => patch({ size: v } as Partial<MapObject>)} />
          </Row>
        </>
      )}
      {o.kind === "pillar" && (
        <Row label="Radius">
          <NumSlider value={o.r} min={2} max={48} onChange={(v) => patch({ r: v } as Partial<MapObject>)} />
        </Row>
      )}
      {o.kind === "stairs" && (
        <>
          <Row label="Size">
            <NumSlider value={o.size} min={16} max={200} onChange={(v) => patch({ size: v } as Partial<MapObject>)} />
          </Row>
          <Row label="Steps">
            <NumSlider value={o.steps} min={2} max={20} onChange={(v) => patch({ steps: v } as Partial<MapObject>)} />
          </Row>
        </>
      )}

      <div className="mt-3">
        <Label className="text-xs font-normal text-muted-foreground">Notes</Label>
        <Textarea
          value={o.notes ?? ""}
          onChange={(e) => patch({ notes: e.target.value })}
          rows={3}
          className="mt-1 text-xs"
          placeholder="GM notes, stat block, loot…"
        />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Custom fields</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label="Add field"
            onClick={() => patch({ props: [...props, { key: "", value: "" }] } as Partial<MapObject>)}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        {props.map((pr, i) => (
          <div key={i} className="mb-1 flex items-center gap-1">
            <Input value={pr.key} placeholder="key" onChange={(e) => setProp(i, e.target.value, pr.value)} className="h-7 w-1/2 text-[11px]" />
            <Input value={pr.value} placeholder="value" onChange={(e) => setProp(i, pr.key, e.target.value)} className="h-7 w-1/2 text-[11px]" />
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove field"
              onClick={() => patch({ props: props.filter((_, j) => j !== i) } as Partial<MapObject>)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
