import { Eye, EyeOff, Brush, SquareDashed, Trash2, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

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
};

export function FogPanel(p: Props) {
  return (
    <section className="space-y-2">
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

      <div className="grid grid-cols-2 gap-1">
        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={p.onHideAll}>
          <Moon className="mr-1 h-3 w-3" /> Hide all
        </Button>
        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={p.onRevealAll}>
          <Trash2 className="mr-1 h-3 w-3" /> Clear fog
        </Button>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Fog is shown translucent to you and solid in Player View and shared links.
      </p>
    </section>
  );
}
