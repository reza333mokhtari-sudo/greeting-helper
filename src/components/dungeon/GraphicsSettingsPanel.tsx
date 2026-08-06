import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Settings } from "@/lib/dungeon/model";
import { Activity, Camera, Cpu } from "lucide-react";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

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

export function GraphicsSettingsPanel({ settings: s, onChange }: Props) {
  const setPreset = (preset: Settings["qualityPreset"]) => {
    const patches: Record<Settings["qualityPreset"], Partial<Settings>> = {
      low: { qualityPreset: "low", renderScale: 0.5, antiAliasing: false, shadow: false, hatch: false },
      medium: { qualityPreset: "medium", renderScale: 0.8, antiAliasing: true, shadow: true, hatch: true },
      high: { qualityPreset: "high", renderScale: 1.0, antiAliasing: true, shadow: true, hatch: true },
      ultra: { qualityPreset: "ultra", renderScale: 1.5, antiAliasing: true, shadow: true, hatch: true },
    };
    onChange(patches[preset]);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Cpu className="h-3.5 w-3.5 text-accent" /> Engine & Quality
      </div>

      <section className="space-y-1.5">
        <Row label="Preset">
          <Select value={s.qualityPreset} onValueChange={(v) => setPreset(v as any)}>
            <SelectTrigger className="h-7 w-28 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="ultra">Ultra</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Render scale">
          <NumSlider value={s.renderScale} min={0.25} max={2} step={0.05} onChange={(v) => onChange({ renderScale: v })} />
        </Row>
        <Row label="Anti-aliasing">
          <Switch checked={s.antiAliasing} onCheckedChange={(v) => onChange({ antiAliasing: v })} />
        </Row>
        <Row label="Shadows">
          <Switch checked={s.shadow} onCheckedChange={(v) => onChange({ shadow: v })} />
        </Row>
      </section>

      <Separator className="opacity-50" />

      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Camera className="h-3.5 w-3.5 text-accent" /> Camera Mode
      </div>

      <section className="space-y-1.5">
        <Row label="Enabled">
          <Switch checked={s.cameraMode} onCheckedChange={(v) => onChange({ cameraMode: v })} />
        </Row>
        <Row label="Projection">
          <Select value={s.cameraProjection} onValueChange={(v) => onChange({ cameraProjection: v as any })}>
            <SelectTrigger className="h-7 w-28 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perspective">Perspective</SelectItem>
              <SelectItem value="orthographic">Orthographic</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="FOV">
          <NumSlider value={s.cameraFov} min={30} max={120} onChange={(v) => onChange({ cameraFov: v })} />
        </Row>
        <Row label="Sensitivity">
          <NumSlider value={s.cameraSensitivity * 10} min={1} max={50} onChange={(v) => onChange({ cameraSensitivity: v / 10 })} />
        </Row>
        <Row label="Damping">
          <NumSlider value={s.cameraDamping * 100} min={1} max={50} onChange={(v) => onChange({ cameraDamping: v / 100 })} />
        </Row>
        <Row label="Invert Y">
          <Switch checked={s.cameraInvertY} onCheckedChange={(v) => onChange({ cameraInvertY: v })} />
        </Row>
        <Row label="Show axes">
          <Switch checked={s.showAxes} onCheckedChange={(v) => onChange({ showAxes: v })} />
        </Row>
      </section>

      <div className="rounded-md bg-muted/30 p-2.5 text-[10px] leading-relaxed text-muted-foreground border border-border/40">
        <p className="font-medium text-foreground/80 mb-1 flex items-center gap-1.5">
          <Activity className="size-3" /> Senior Engine Note
        </p>
        Camera Mode enables a 3D orbit view. Use <kbd className="bg-muted px-1 rounded text-[9px]">L-DRAG</kbd> to orbit, 
        <kbd className="bg-muted px-1 rounded text-[9px]">R-DRAG</kbd> to pan, and <kbd className="bg-muted px-1 rounded text-[9px]">SCROLL</kbd> to zoom. 
        Higher presets enable heavier post-processing.
      </div>
    </section>
  );
}
