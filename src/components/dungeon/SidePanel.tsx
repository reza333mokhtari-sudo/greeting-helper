import type { GridStyle, NgonOpts, Settings } from "@/lib/dungeon/model";
import { THEMES } from "@/lib/dungeon/model";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Maximize2, FileImage, FileType2, FileText, Save, Upload, Trash2 } from "lucide-react";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  brushWidth: number;
  onBrushWidth: (v: number) => void;
  doorVariant: string;
  onDoorVariant: (v: string) => void;
  ngon: NgonOpts;
  onNgon: (patch: Partial<NgonOpts>) => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onClear: () => void;
  onFit: () => void;
};

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 text-[11px] transition-colors ${
            value === o.value ? "bg-primary text-primary-foreground" : "bg-card/40 text-muted-foreground hover:bg-accent"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-1 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function NumSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v ?? value)}
        className="w-24"
      />
      <span className="w-7 text-right text-xs tabular-nums text-foreground/80">{Math.round(value)}</span>
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

export function SidePanel(props: Props) {
  const { settings: s, onChange } = props;
  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-sidebar">
      <ScrollArea className="min-h-0 flex-1 panel-scroll">
        <div className="flex flex-col gap-5 p-4">
          <section>
            <SectionTitle>Grid</SectionTitle>
            <Row label="Size">
              <NumSlider value={s.gridSize} min={8} max={128} step={2} onChange={(v) => onChange({ gridSize: v })} />
            </Row>
            <Row label="Style">
              <Select value={s.gridStyle} onValueChange={(v) => onChange({ gridStyle: v as GridStyle })}>
                <SelectTrigger className="w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="hex">Hex</SelectItem>
                  <SelectItem value="dot">Dots</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Snap to grid">
              <Switch checked={s.snap} onCheckedChange={(v) => onChange({ snap: v })} />
            </Row>
          </section>

          <Separator />

          <section>
            <SectionTitle>Circle / Regular polygon (K)</SectionTitle>
            <Row label="Mode">
              <Segmented
                value={props.ngon.mode}
                options={[
                  { value: "draw", label: "Draw" },
                  { value: "erase", label: "Erase" },
                ]}
                onChange={(v) => props.onNgon({ mode: v })}
              />
            </Row>
            <Row label="Snap">
              <Switch checked={props.ngon.snap} onCheckedChange={(v) => props.onNgon({ snap: v })} />
            </Row>
            <Row label="Division">
              <Segmented
                value={String(props.ngon.division) as "1" | "2"}
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "1/2" },
                ]}
                onChange={(v) => props.onNgon({ division: v === "2" ? 2 : 1 })}
              />
            </Row>
            <Row label="Rough">
              <Switch checked={props.ngon.rough} onCheckedChange={(v) => props.onNgon({ rough: v })} />
            </Row>
            <Row label="Sides">
              <NumSlider value={props.ngon.sides} min={3} max={48} onChange={(v) => props.onNgon({ sides: v })} />
            </Row>
            <Row label="Draw to">
              <Segmented
                value={props.ngon.drawTo}
                options={[
                  { value: "point", label: "Point" },
                  { value: "edge", label: "Edge" },
                ]}
                onChange={(v) => props.onNgon({ drawTo: v })}
              />
            </Row>
            <p className="mt-2 rounded-md bg-muted/50 p-2 text-[10px] leading-relaxed text-muted-foreground">
              Drag from the centre outwards. Raise sides to 48 for a smooth circle.
            </p>
          </section>


          <Separator />

          <section>
            <SectionTitle>Walls</SectionTitle>
            <Row label="Thickness">
              <NumSlider value={s.wallThickness} min={1} max={24} onChange={(v) => onChange({ wallThickness: v })} />
            </Row>
            <Row label="Drop shadow">
              <Switch checked={s.shadow} onCheckedChange={(v) => onChange({ shadow: v })} />
            </Row>
            <Row label="Brush width">
              <NumSlider value={props.brushWidth} min={8} max={160} onChange={props.onBrushWidth} />
            </Row>
            <Row label="Door type">
              <Select value={props.doorVariant} onValueChange={props.onDoorVariant}>
                <SelectTrigger className="w-32 text-xs">
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
          </section>

          <Separator />

          <section>
            <SectionTitle>Theme</SectionTitle>
            <div className="mb-2 grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([key, t]) => (
                <Button
                  key={key}
                  variant="secondary"
                  size="sm"
                  className="h-8 text-[11px]"
                  onClick={() => onChange(t as Partial<Settings>)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <Row label="Background">
              <Color value={s.bgColor} onChange={(v) => onChange({ bgColor: v })} />
            </Row>
            <Row label="Floor">
              <Color value={s.floorColor} onChange={(v) => onChange({ floorColor: v })} />
            </Row>
            <Row label="Wall">
              <Color value={s.wallColor} onChange={(v) => onChange({ wallColor: v })} />
            </Row>
            <Row label="Grid">
              <Color value={s.gridColor} onChange={(v) => onChange({ gridColor: v })} />
            </Row>
            <Row label="Ink / text">
              <Color value={s.inkColor} onChange={(v) => onChange({ inkColor: v })} />
            </Row>
          </section>

          <Separator />

          <section>
            <SectionTitle>Lighting &amp; line of sight</SectionTitle>
            <Row label="Line of sight">
              <Select value={s.losMode} onValueChange={(v) => onChange({ losMode: v as Settings["losMode"] })}>
                <SelectTrigger className="w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="lights">Reveal from lights</SelectItem>
                  <SelectItem value="vision">Vision (fog of war)</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Light glow">
              <Switch checked={s.lighting} onCheckedChange={(v) => onChange({ lighting: v })} />
            </Row>
            <Row label="Ambient light">
              <NumSlider
                value={Math.round(s.ambient * 100)}
                min={0}
                max={95}
                onChange={(v) => onChange({ ambient: v / 100 })}
              />
            </Row>
            <Row label="Darkness colour">
              <Color value={s.fogColor} onChange={(v) => onChange({ fogColor: v })} />
            </Row>
            <p className="mt-2 rounded-md bg-muted/50 p-2 text-[10px] leading-relaxed text-muted-foreground">
              Place light sources with the light tool (F). Room outlines and pillars block sight; doors block it when
              “Blocks light” is on.
            </p>
          </section>
        </div>
      </ScrollArea>

      <div className="flex flex-col gap-2 border-t border-border bg-card/60 p-4">
        <Button variant="outline" size="sm" onClick={props.onFit}>
          <Maximize2 /> Fit map to screen
        </Button>
        <Button size="sm" onClick={props.onExportPng} className="shadow-[var(--shadow-arcane)]">
          <FileImage /> Export PNG
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={props.onExportSvg}>
            <FileType2 /> SVG
          </Button>
          <Button variant="outline" size="sm" onClick={props.onExportPdf}>
            <FileText /> PDF
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={props.onExportJson}>
            <Save /> Save
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload /> Load
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) props.onImportJson(f);
                  e.target.value = "";
                }}
              />
            </label>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onClear}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 /> Clear map
        </Button>
      </div>
    </aside>
  );
}
