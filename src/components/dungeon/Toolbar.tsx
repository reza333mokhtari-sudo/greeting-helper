export type ToolId =
  | "select"
  | "pan"
  | "rect"
  | "ellipse"
  | "poly"
  | "brush"
  | "eraseRect"
  | "eraseBrush"
  | "door"
  | "stairs"
  | "pillar"
  | "text"
  | "npc"
  | "item"
  | "trigger"
  | "light";

export const TOOLS: { id: ToolId; label: string; key: string; icon: string }[] = [
  { id: "select", label: "Select / Move", key: "V", icon: "M4 3l14 8-6 1.6L9.6 19z" },
  { id: "pan", label: "Pan", key: "H", icon: "M11 3a1.4 1.4 0 012.8 0v6h.4V4.6a1.4 1.4 0 012.8 0V12h.4V7a1.4 1.4 0 012.8 0v7.5c0 3.6-2.6 6.5-6.3 6.5-3.7 0-5.6-2-7.2-5L4.4 12c-.6-1.2 1-2.3 2-1.2L8.2 13V3z" },
  { id: "rect", label: "Rectangle room", key: "R", icon: "M3 5h18v14H3z" },
  { id: "ellipse", label: "Oval room", key: "O", icon: "M12 5c5 0 9 3.1 9 7s-4 7-9 7-9-3.1-9-7 4-7 9-7z" },
  { id: "poly", label: "Polygon room", key: "P", icon: "M12 3l9 6.5-3.4 10.5H6.4L3 9.5z" },
  { id: "brush", label: "Corridor brush", key: "B", icon: "M4 19c4-1 4-6 8-8s6-6 8-7c-1 4-4 7-6 9s-6 3-8 7z" },
  { id: "eraseRect", label: "Erase rectangle", key: "X", icon: "M3 15l8-8 8 8-4 4H7z" },
  { id: "eraseBrush", label: "Erase brush", key: "C", icon: "M5 19h14M6 15l7-8 5 5-6 6H8z" },
  { id: "door", label: "Door", key: "D", icon: "M6 3h12v18H6zM14 12h1.6" },
  { id: "stairs", label: "Stairs", key: "S", icon: "M3 21h5v-5h5v-5h5V6h3" },
  { id: "pillar", label: "Pillar", key: "L", icon: "M12 6a6 6 0 110 12 6 6 0 010-12z" },
  { id: "text", label: "Label", key: "T", icon: "M5 5h14v3M12 5v14M9 19h6" },
  { id: "npc", label: "NPC token", key: "N", icon: "M12 4a3.6 3.6 0 110 7.2A3.6 3.6 0 0112 4zM4.5 20c.6-4 3.7-6 7.5-6s6.9 2 7.5 6" },
  { id: "item", label: "Item / loot", key: "I", icon: "M12 3l9 9-9 9-9-9z" },
  { id: "trigger", label: "Trigger zone", key: "G", icon: "M4 4h16v16H4zM9 9h6v6H9z" },
  { id: "light", label: "Light source", key: "F", icon: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4M12 8a4 4 0 110 8 4 4 0 010-8z" },
];

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Undo2, Redo2, ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  tool: ToolId;
  onTool: (t: ToolId) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoom: (dir: 1 | -1) => void;
};

export function Toolbar(props: Props) {
  return (
    <TooltipProvider delayDuration={200}>
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-3">
      {TOOLS.map((t) => {
        const active = props.tool === t.id;
        return (
          <Tooltip key={t.id}>
            <TooltipTrigger asChild>
              <Button
                variant={active ? "default" : "ghost"}
                size="icon"
                aria-label={t.label}
                aria-pressed={active}
                onClick={() => props.onTool(t.id)}
                className={active ? "size-10 shadow-[var(--shadow-arcane)]" : "size-10 text-foreground/70"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                >
                  <path d={t.icon} />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {t.label} <span className="opacity-60">({t.key})</span>
            </TooltipContent>
          </Tooltip>
        );
      })}

      <Separator className="my-2 w-8" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Undo" disabled={!props.canUndo} onClick={props.onUndo}>
            <Undo2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Redo" disabled={!props.canRedo} onClick={props.onRedo}>
            <Redo2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Redo (Ctrl+Shift+Z)</TooltipContent>
      </Tooltip>

      <Separator className="my-2 w-8" />

      <Button variant="ghost" size="icon" aria-label="Zoom in" onClick={() => props.onZoom(1)}>
        <ZoomIn />
      </Button>
      <span className="text-[10px] tabular-nums text-muted-foreground">{Math.round(props.zoom * 100)}%</span>
      <Button variant="ghost" size="icon" aria-label="Zoom out" onClick={() => props.onZoom(-1)}>
        <ZoomOut />
      </Button>
    </div>
    </TooltipProvider>
  );
}

