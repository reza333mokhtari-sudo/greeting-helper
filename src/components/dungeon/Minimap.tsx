import { useEffect, useRef, useCallback, useState as useEffectState } from "react";
import { ZoomIn, ZoomOut, Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Doc, type View, type Pt, docBounds, shapePoints, objectRadius } from "@/lib/dungeon/model";

type Props = {
  doc: Doc;
  view: View;
  onNavigate: (world: Pt) => void;
  initialPos?: { x: number; y: number };
  onPositionChange?: (pos: { x: number; y: number }) => void;
};

export function Minimap({ doc, view, onNavigate, initialPos, onPositionChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useEffectState(initialPos || { x: 16, y: 16 });
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDraggingMap = useRef(false);

  const [minimapZoom, setMinimapZoom] = useEffectState(1.0);
  const size = 160;
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bounds = docBounds(doc) ?? { x1: 0, y1: 0, x2: 400, y2: 300 };
    const pad = Math.max(40, (bounds.x2 - bounds.x1) * 0.1, (bounds.y2 - bounds.y1) * 0.1);
    const x1 = bounds.x1 - pad;
    const y1 = bounds.y1 - pad;
    const x2 = bounds.x2 + pad;
    const y2 = bounds.y2 + pad;
    const bw = Math.max(1, x2 - x1);
    const bh = Math.max(1, y2 - y1);
    const scale = Math.min(size / bw, size / bh) * minimapZoom;
    const ox = (size - bw * scale) / 2 - x1 * scale;
    const oy = (size - bh * scale) / 2 - y1 * scale;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = doc.settings.bgColor;
    ctx.fillRect(0, 0, size * dpr, size * dpr);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);

    // Floor shapes
    ctx.fillStyle = doc.settings.floorColor;
    ctx.strokeStyle = doc.settings.wallColor;
    ctx.lineWidth = 2 / scale;
    for (const s of doc.shapes) {
      if (s.erase) continue;
      const pts = shapePoints(s);
      ctx.beginPath();
      if (s.kind === "rect") {
        ctx.rect(Math.min(pts[0]!.x, pts[1]!.x), Math.min(pts[0]!.y, pts[1]!.y), Math.abs(pts[1]!.x - pts[0]!.x), Math.abs(pts[1]!.y - pts[0]!.y));
      } else if (s.kind === "ellipse") {
        ctx.ellipse(
          (pts[0]!.x + pts[1]!.x) / 2,
          (pts[0]!.y + pts[1]!.y) / 2,
          Math.abs(pts[1]!.x - pts[0]!.x) / 2,
          Math.abs(pts[1]!.y - pts[0]!.y) / 2,
          0,
          0,
          Math.PI * 2,
        );
      } else {
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        if (s.kind === "poly") ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
    }

    // Objects
    for (const o of doc.objects) {
      const r = Math.max(2, objectRadius(o) * 0.25);
      ctx.fillStyle = o.kind === "npc" ? o.color : o.kind === "item" ? o.color : "#4da3ff";
      ctx.beginPath();
      ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Viewport rectangle
    const el = wrapRef.current;
    if (el) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const vx = (-view.x / view.scale) * scale + ox;
      const vy = (-view.y / view.scale) * scale + oy;
      const vw = (el.clientWidth / view.scale) * scale;
      const vh = (el.clientHeight / view.scale) * scale;
      ctx.strokeStyle = "#4da3ff";
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(vx * dpr, vy * dpr, vw * dpr, vh * dpr);
      ctx.fillStyle = "rgba(77, 163, 255, 0.12)";
      ctx.fillRect(vx * dpr, vy * dpr, vw * dpr, vh * dpr);
    }
  }, [doc, view, dpr, minimapZoom]);

  useEffect(() => {
    draw();
  }, [draw]);

  const toWorld = (clientX: number, clientY: number): Pt => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const px = (clientX - rect.left) / size;
    const py = (clientY - rect.top) / size;
    const bounds = docBounds(doc) ?? { x1: 0, y1: 0, x2: 400, y2: 300 };
    const pad = Math.max(40, (bounds.x2 - bounds.x1) * 0.1, (bounds.y2 - bounds.y1) * 0.1);
    const x1 = bounds.x1 - pad;
    const y1 = bounds.y1 - pad;
    const x2 = bounds.x2 + pad;
    const y2 = bounds.y2 + pad;
    const bw = Math.max(1, x2 - x1);
    const bh = Math.max(1, y2 - y1);
    const scale = Math.min(size / bw, size / bh) * minimapZoom;
    const ox = (size - bw * scale) / 2 - x1 * scale;
    const oy = (size - bh * scale) / 2 - y1 * scale;
    return { x: (px * size - ox) / scale, y: (py * size - oy) / scale };
  };

  const handlePointer = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.type === "pointerdown") return;
    
    const target = e.target as HTMLElement;
    const isHandle = target.closest('.minimap-handle');

    if (e.type === "pointerdown") {
      if (isHandle) {
        isDraggingMap.current = true;
        dragStartPos.current = { x: e.clientX + pos.x, y: e.clientY - pos.y };
        target.setPointerCapture?.(e.pointerId);
        return;
      }
      dragging.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
    
    if (e.type === "pointermove") {
      if (isDraggingMap.current && dragStartPos.current) {
        const newX = dragStartPos.current.x - e.clientX;
        const newY = e.clientY - dragStartPos.current.y;
        setPos({ x: newX, y: newY });
        onPositionChange?.({ x: newX, y: newY });
        return;
      }
      if (dragging.current) {
        onNavigate(toWorld(e.clientX, e.clientY));
      }
      return;
    }

    if (e.type === "pointerup" || e.type === "pointerleave") {
      dragging.current = false;
      isDraggingMap.current = false;
      dragStartPos.current = null;
    }
    
    if (e.type === "pointerdown" && !isHandle) {
       onNavigate(toWorld(e.clientX, e.clientY));
    }
  };

  return (
    <div
      ref={wrapRef}
      className="pointer-events-auto absolute z-20 overflow-hidden rounded-lg border border-border/60 bg-card/80 shadow-lg backdrop-blur sm:w-[160px] sm:h-[160px] w-[120px] h-[120px]"
      style={{ 
        right: pos.x, 
        top: pos.y,
        width: typeof window !== 'undefined' && window.innerWidth < 640 ? 120 : 160,
        height: typeof window !== 'undefined' && window.innerWidth < 640 ? 120 : 160
      }}
      onPointerDown={handlePointer}
      onPointerMove={handlePointer}
      onPointerUp={handlePointer}
      onPointerLeave={handlePointer}
      title="Minimap: drag handle to move, click map to navigate"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="minimap-handle pointer-events-auto absolute inset-x-0 top-0 h-6 cursor-move bg-background/20 hover:bg-background/40 transition-colors flex items-center justify-between px-1.5">
        <div className="rounded bg-background/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Map
        </div>
        <div className="flex items-center gap-1 pointer-events-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 bg-background/60 hover:bg-background" 
            title="Reset View"
            onClick={(e) => { e.stopPropagation(); onNavigate({ x: 0, y: 0 }); }}
          >
            <RotateCcw className="h-2.5 w-2.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 bg-background/60 hover:bg-background" 
            title="Zoom Out"
            onClick={(e) => { e.stopPropagation(); setMinimapZoom(z => Math.max(0.2, z - 0.2)); }}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 bg-background/60 hover:bg-background" 
            title="Zoom In"
            onClick={(e) => { e.stopPropagation(); setMinimapZoom(z => Math.min(5, z + 0.2)); }}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
