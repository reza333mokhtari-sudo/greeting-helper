import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  toolLabel: string;
  cell: string;
  zoom: number;
  shapes: number;
  objects: number;
  fog: number;
  saved: string;
  saveStatus?: SaveStatus;
  onZoom: (dir: 1 | -1) => void;
  onFit: () => void;
};

const statusDot: Record<SaveStatus, string> = {
  idle: "bg-muted-foreground",
  saving: "bg-amber-400 animate-pulse",
  saved: "bg-emerald-500",
  error: "bg-destructive",
};

const statusLabel: Record<SaveStatus, string> = {
  idle: "Idle",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

export function StatusBar(props: Props) {
  const saveStatus = props.saveStatus ?? "idle";
  return (
    <footer className="flex h-8 shrink-0 items-center gap-3 border-t border-border bg-sidebar px-3 text-[11px] text-muted-foreground">
      <Badge variant="secondary" className="h-5 text-[10px] font-medium">
        {props.toolLabel}
      </Badge>
      <span className="tabular-nums">cell {props.cell}</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="tabular-nums">{props.shapes} shapes</span>
      <span className="tabular-nums">{props.objects} objects</span>
      <span className="tabular-nums">{props.fog} fogged</span>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-1.5" title={`Last save: ${props.saved}`}>
        <span className={`inline-block size-1.5 rounded-full ${statusDot[saveStatus]}`} />
        <span className="tabular-nums font-medium">{statusLabel[saveStatus]}</span>
        {saveStatus === "saved" && props.saved && (
          <span className="ml-1 text-[9px] opacity-60">{props.saved}</span>
        )}
      </div>
      <Separator orientation="vertical" className="h-4" />
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <span className="size-1 rounded-full bg-emerald-500/40" />
        Session: Active
      </span>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-6" aria-label="Zoom out" onClick={() => props.onZoom(-1)}>
          <ZoomOut className="size-3.5" />
        </Button>
        <span className="w-10 text-center tabular-nums text-foreground/80">{Math.round(props.zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="size-6" aria-label="Zoom in" onClick={() => props.onZoom(1)}>
          <ZoomIn className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-6" aria-label="Fit map" onClick={props.onFit}>
          <Maximize2 className="size-3.5" />
        </Button>
      </div>
    </footer>
  );
}

