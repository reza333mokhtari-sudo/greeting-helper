import { useEffect, useRef, useCallback } from "react";
import { type Doc, type View, type Pt, docBounds, shapePoints, objectRadius } from "@/lib/dungeon/model";

type Props = {
  doc: Doc;
  view: View;
  onNavigate: (world: Pt) => void;
};

export function Minimap({ doc, view, onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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
    const scale = Math.min(size / bw, size / bh);
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
      const vx = view.x + ox * scale;
      const vy = view.y + oy * scale;
      const vw = el.clientWidth / view.scale * scale;
      const vh = el.clientHeight / view.scale * scale;
      ctx.strokeStyle = "#4da3ff";
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect(vx * dpr, vy * dpr, vw * dpr, vh * dpr);
      ctx.fillStyle = "rgba(77, 163, 255, 0.12)";
      ctx.fillRect(vx * dpr, vy * dpr, vw * dpr, vh * dpr);
    }
  }, [doc, view, dpr]);

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
    const scale = Math.min(size / bw, size / bh);
    const ox = (size - bw * scale) / 2 - x1 * scale;
    const oy = (size - bh * scale) / 2 - y1 * scale;
    return { x: (px * size - ox) / scale, y: (py * size - oy) / scale };
  };

  const handlePointer = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.type === "pointerdown") return;
    if (e.type === "pointerdown") {
      dragging.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
    if (e.type === "pointerup" || e.type === "pointerleave") {
      dragging.current = false;
    }
    onNavigate(toWorld(e.clientX, e.clientY));
  };

  return (
    <div
      ref={wrapRef}
      className="pointer-events-auto absolute right-4 top-4 z-10 overflow-hidden rounded-lg border border-border/60 bg-card/80 shadow-lg backdrop-blur"
      style={{ width: size, height: size }}
      onPointerDown={handlePointer}
      onPointerMove={(e) => dragging.current && handlePointer(e)}
      onPointerUp={handlePointer}
      onPointerLeave={handlePointer}
      title="Minimap: drag to navigate"
    >
      <canvas ref={canvasRef} className="block" />
      <div className="pointer-events-none absolute left-1.5 top-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        Map
      </div>
    </div>
  );
}
