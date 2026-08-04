import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type Props = {
  toolLabel: string;
  cell: string;
  zoom: number;
  shapes: number;
  objects: number;
  fog: number;
  saved: string;
  onZoom: (dir: 1 | -1) => void;
  onFit: () => void;
};

export function StatusBar(props: Props) {
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
      <span className="truncate">{props.saved}</span>
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
