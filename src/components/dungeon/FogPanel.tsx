import { useMemo } from "react";
import { Eye, EyeOff, Brush, SquareDashed, Trash2, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FOG_STYLES, fogThumbnail, type FogStyle } from "@/lib/dungeon/fogAssets";

export type FogMode = "brush" | "select";

type Props = {
  count: number;
  mode: FogMode;
  onMode: (m: FogMode) => void;
  brush: number;
  onBrush: (v: number) => void;
  onHideAll: () => void;
  onRevealAll: () => void;
  activeTool: "hide" | "reveal" | null;
  onTool: (t: "hide" | "reveal") => void;
  style: FogStyle;
  softness: number;
  gmOpacity: number;
  scale: number;
  color: string;
  onSettings: (patch: {
    fogStyle?: FogStyle;
    fogSoftness?: number;
    fogGmOpacity?: number;
    fogScale?: number;
    fogColor?: string;
  }) => void;
};

export function FogPanel(p: Props) {
  const thumbs = useMemo(() => {
    if (typeof document === "undefined") return {} as Record<string, string>;
    const out: Record<string, string> = {};
    for (const s of FOG_STYLES) out[s.id] = fogThumbnail(s.id, p.color);
    return out;
  }, [p.color]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Fog of war</h2>
        <Badge variant="secondary" className="text-[9px] tabular-nums">{p.count} hidden</Badge>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <Button
          size="sm"
          variant={p.activeTool === "hide" ? "default" : "outline"}
          className="h-7 text-[10px]"
          onClick={() => p.onTool("hide")}
        >
          <EyeOff className="mr-1 h-3 w-3" /> Hide (Q)
        </Button>
        <Button
          size="sm"
          variant={p.activeTool === "reveal" ? "default" : "outline"}
          className="h-7 text-[10px]"
          onClick={() => p.onTool("reveal")}
        >
          <Eye className="mr-1 h-3 w-3" /> Reveal (W)
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <Button size="sm" variant={p.mode === "brush" ? "secondary" : "ghost"} className="h-6 text-[10px]" onClick={() => p.onMode("brush")}>
          <Brush className="mr-1 h-3 w-3" /> Brush
        </Button>
        <Button size="sm" variant={p.mode === "select" ? "secondary" : "ghost"} className="h-6 text-[10px]" onClick={() => p.onMode("select")}>
          <SquareDashed className="mr-1 h-3 w-3" /> Selector
        </Button>
      </div>

      {p.mode === "brush" && (
        <label className="block space-y-1">
          <span className="flex justify-between text-[10px] text-muted-foreground">
            <span>Brush radius</span>
            <span className="tabular-nums">{p.brush}px</span>
          </span>
          <Slider value={[p.brush]} min={8} max={320} step={4} onValueChange={([v]) => p.onBrush(v ?? p.brush)} />
        </label>
      )}

      {/* 2D fog asset library */}
      <div className="space-y-1.5 rounded-lg border border-border/60 bg-card/40 p-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fog asset</span>
        <div className="grid grid-cols-3 gap-1.5">
          {FOG_STYLES.map((s) => (
            <Tooltip key={s.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => p.onSettings({ fogStyle: s.id })}
                  className={cn(
                    "group overflow-hidden rounded-md border text-left transition",
                    p.style === s.id ? "border-primary ring-1 ring-primary/60" : "border-border/60 hover:border-primary/50",
                  )}
                >
                  <span
                    className="block h-9 w-full bg-muted bg-cover bg-center"
                    style={thumbs[s.id] ? { backgroundImage: `url(${thumbs[s.id]})` } : undefined}
                  />
                  <span className="block px-1 py-0.5 text-[9px] text-muted-foreground group-hover:text-foreground">{s.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[10px]">{s.hint}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <label className="block space-y-1">
          <span className="flex justify-between text-[10px] text-muted-foreground">
            <span>Edge softness</span>
            <span className="tabular-nums">{Math.round(p.softness * 100)}%</span>
          </span>
          <Slider value={[p.softness]} min={0} max={1} step={0.05} onValueChange={([v]) => p.onSettings({ fogSoftness: v ?? p.softness })} />
        </label>

        <label className="block space-y-1">
          <span className="flex justify-between text-[10px] text-muted-foreground">
            <span>GM opacity</span>
            <span className="tabular-nums">{Math.round(p.gmOpacity * 100)}%</span>
          </span>
          <Slider value={[p.gmOpacity]} min={0.15} max={1} step={0.02} onValueChange={([v]) => p.onSettings({ fogGmOpacity: v ?? p.gmOpacity })} />
        </label>

        <label className="block space-y-1">
          <span className="flex justify-between text-[10px] text-muted-foreground">
            <span>Texture scale</span>
            <span className="tabular-nums">{p.scale.toFixed(2)}x</span>
          </span>
          <Slider value={[p.scale]} min={0.3} max={3} step={0.05} onValueChange={([v]) => p.onSettings({ fogScale: v ?? p.scale })} />
        </label>

        <label className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Fog colour</span>
          <input
            type="color"
            value={p.color}
            onChange={(e) => p.onSettings({ fogColor: e.target.value })}
            className="h-6 w-10 cursor-pointer rounded border border-border/60 bg-transparent"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={p.onHideAll}>
          <Moon className="mr-1 h-3 w-3" /> Hide all
        </Button>
        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={p.onRevealAll}>
          <Trash2 className="mr-1 h-3 w-3" /> Clear fog
        </Button>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Fog is drawn with the selected 2D asset — translucent to you, solid in Player View and shared links.
      </p>
    </section>
  );
}
