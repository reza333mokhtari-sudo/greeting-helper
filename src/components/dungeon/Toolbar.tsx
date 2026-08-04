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
  | "text";

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
];

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
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-3">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={`${t.label} (${t.key})`}
          onClick={() => props.onTool(t.id)}
          className={`group relative flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
            props.tool === t.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
            <path d={t.icon} />
          </svg>
        </button>
      ))}
      <div className="my-2 h-px w-8 bg-border" />
      <button title="Undo (Ctrl+Z)" disabled={!props.canUndo} onClick={props.onUndo} className="flex h-9 w-10 items-center justify-center rounded-md text-foreground/70 hover:bg-accent disabled:opacity-30">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h9a7 7 0 010 14H8" />
        </svg>
      </button>
      <button title="Redo (Ctrl+Shift+Z)" disabled={!props.canRedo} onClick={props.onRedo} className="flex h-9 w-10 items-center justify-center rounded-md text-foreground/70 hover:bg-accent disabled:opacity-30">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14l5-5-5-5" />
          <path d="M20 9h-9a7 7 0 000 14h5" />
        </svg>
      </button>
      <div className="my-2 h-px w-8 bg-border" />
      <button title="Zoom in" onClick={() => props.onZoom(1)} className="h-8 w-10 rounded-md text-sm hover:bg-accent">
        +
      </button>
      <span className="text-[10px] tabular-nums text-muted-foreground">{Math.round(props.zoom * 100)}%</span>
      <button title="Zoom out" onClick={() => props.onZoom(-1)} className="h-8 w-10 rounded-md text-sm hover:bg-accent">
        −
      </button>
    </div>
  );
}
