import { useEffect, useState } from "react";
import { Activity, RotateCcw } from "lucide-react";

import { readPerf, resetPerf, type PerfStats } from "@/lib/dungeon/perf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type Props = {
  shapes: number;
  objects: number;
  layers: number;
  fog: number;
  docBytes: number;
  savedAt: number | null;
  saveMs: number | null;
  online: boolean;
};

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad";
}) {
  const color =
    tone === "bad" ? "text-destructive" : tone === "warn" ? "text-accent" : "text-foreground";
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums font-medium ${color}`}>{value}</span>
    </div>
  );
}

/** Live performance / health readout for the editor. */
export function DiagnosticsPanel(props: Props) {
  const [stats, setStats] = useState<PerfStats>(() => readPerf());

  useEffect(() => {
    const t = setInterval(() => setStats(readPerf()), 500);
    return () => clearInterval(t);
  }, []);

  const fpsTone = stats.fps >= 50 ? "good" : stats.fps >= 30 ? "warn" : "bad";
  const drawTone = stats.drawMs <= 8 ? "good" : stats.drawMs <= 16 ? "warn" : "bad";
  const complexity = props.shapes + props.objects * 2 + props.fog / 8;
  const load = Math.min(100, (complexity / 1200) * 100);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Activity className="h-3 w-3 text-accent" /> Diagnostics
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Reset counters"
          onClick={() => {
            resetPerf();
            setStats(readPerf());
          }}
        >
          <RotateCcw className="size-3" />
        </Button>
      </div>

      <div className="space-y-1.5 rounded-md border border-border/60 bg-card/60 p-2">
        <Row
          label="Frames per second"
          value={stats.fps ? stats.fps.toFixed(0) : "—"}
          tone={fpsTone}
        />
        <Row
          label="Frame interval"
          value={stats.frameMs ? `${stats.frameMs.toFixed(1)} ms` : "—"}
        />
        <Row label="Render time (avg)" value={`${stats.drawMs.toFixed(2)} ms`} tone={drawTone} />
        <Row label="Render time (peak)" value={`${stats.drawMaxMs.toFixed(2)} ms`} />
        <Row
          label="Slow frames (>33ms)"
          value={`${stats.longFrames} / ${stats.totalFrames}`}
          tone={stats.longFrames > stats.totalFrames * 0.1 ? "warn" : "good"}
        />
      </div>

      <Separator />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Scene load</span>
          <span className="tabular-nums">{load.toFixed(0)}%</span>
        </div>
        <Progress value={load} className="h-1.5" />
        <Row label="Shapes" value={String(props.shapes)} />
        <Row label="Objects" value={String(props.objects)} />
        <Row label="Layers" value={String(props.layers)} />
        <Row label="Fogged cells" value={String(props.fog)} />
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Row
          label="Document size"
          value={`${(props.docBytes / 1024).toFixed(1)} KB`}
          tone={props.docBytes > 3_000_000 ? "warn" : "good"}
        />
        <Row
          label="Autosave duration"
          value={props.saveMs == null ? "—" : `${props.saveMs.toFixed(1)} ms`}
        />
        <Row
          label="Last autosave"
          value={props.savedAt ? new Date(props.savedAt).toLocaleTimeString() : "—"}
        />
        <Row
          label="JS heap"
          value={stats.heapMb == null ? "n/a" : `${stats.heapMb.toFixed(1)} MB`}
        />
        <Row label="Pixel ratio" value={`${stats.dpr}×`} />
      </div>

      <Badge
        variant={props.online ? "secondary" : "destructive"}
        className="w-full justify-center text-[10px]"
      >
        {props.online ? "Online — cloud sync available" : "Offline — working locally"}
      </Badge>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Tip: heavy hatching, high roughness and large fog areas cost the most render time. Hide
        layers you are not editing to recover frames.
      </p>
    </section>
  );
}
