import type { Doc, MapObject, Pt, Shape, View } from "./model";

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.floor(w));
  c.height = Math.max(1, Math.floor(h));
  return c;
}

function applyView(ctx: CanvasRenderingContext2D, view: View, dpr: number) {
  ctx.setTransform(view.scale * dpr, 0, 0, view.scale * dpr, view.x * dpr, view.y * dpr);
}

function tracePath(ctx: CanvasRenderingContext2D, s: Shape) {
  ctx.beginPath();
  if (s.kind === "rect") {
    ctx.rect(Math.min(s.a.x, s.b.x), Math.min(s.a.y, s.b.y), Math.abs(s.b.x - s.a.x), Math.abs(s.b.y - s.a.y));
  } else if (s.kind === "ellipse") {
    const cx = (s.a.x + s.b.x) / 2;
    const cy = (s.a.y + s.b.y) / 2;
    ctx.ellipse(cx, cy, Math.abs(s.b.x - s.a.x) / 2, Math.abs(s.b.y - s.a.y) / 2, 0, 0, Math.PI * 2);
  } else if (s.kind === "poly") {
    s.pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
  } else {
    s.pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  }
}

function drawShapes(ctx: CanvasRenderingContext2D, shapes: Shape[], color: string) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const s of shapes) {
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    tracePath(ctx, s);
    if (s.kind === "path") {
      ctx.lineWidth = s.width;
      if (s.pts.length === 1) {
        const p = s.pts[0]!;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.stroke();
      }
    } else {
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawGrid(ctx: CanvasRenderingContext2D, doc: Doc, view: View, w: number, h: number, dpr: number) {
  const { gridSize, gridStyle, gridColor } = doc.settings;
  if (gridStyle === "none" || gridSize * view.scale < 4) return;
  const x1 = -view.x / view.scale;
  const y1 = -view.y / view.scale;
  const x2 = (w - view.x) / view.scale;
  const y2 = (h - view.y) / view.scale;
  ctx.save();
  applyView(ctx, view, dpr);
  ctx.globalCompositeOperation = "source-atop";
  ctx.strokeStyle = gridColor;
  ctx.fillStyle = gridColor;
  ctx.lineWidth = 1 / view.scale;
  const sx = Math.floor(x1 / gridSize) * gridSize;
  const sy = Math.floor(y1 / gridSize) * gridSize;
  if (gridStyle === "square") {
    ctx.beginPath();
    for (let x = sx; x <= x2; x += gridSize) {
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
    }
    for (let y = sy; y <= y2; y += gridSize) {
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
    }
    ctx.stroke();
  } else {
    const r = Math.max(1, 1.6 / view.scale);
    for (let x = sx; x <= x2; x += gridSize) {
      for (let y = sy; y <= y2; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawObject(ctx: CanvasRenderingContext2D, o: MapObject, doc: Doc, scale: number) {
  const { wallColor, floorColor, inkColor } = doc.settings;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.kind !== "pillar" && o.kind !== "text") ctx.rotate(o.angle);
  ctx.lineJoin = "round";
  ctx.lineCap = "butt";

  if (o.kind === "door") {
    const s = o.size;
    const t = Math.max(6, doc.settings.wallThickness * 1.6);
    ctx.lineWidth = Math.max(2, doc.settings.wallThickness * 0.5);
    ctx.strokeStyle = wallColor;
    ctx.fillStyle = floorColor;
    if (o.variant === "archway") {
      ctx.fillRect(-s / 2, -t / 2, s, t);
      ctx.beginPath();
      ctx.moveTo(-s / 2, -t / 2);
      ctx.lineTo(-s / 2, t / 2);
      ctx.moveTo(s / 2, -t / 2);
      ctx.lineTo(s / 2, t / 2);
      ctx.stroke();
    } else if (o.variant === "secret") {
      ctx.fillRect(-s / 2, -t / 2, s, t);
      ctx.strokeRect(-s / 2, -t / 2, s, t);
      ctx.fillStyle = wallColor;
      ctx.font = `bold ${s * 0.55}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("S", 0, 1);
    } else if (o.variant === "double") {
      ctx.fillRect(-s / 2, -t / 2, s, t);
      ctx.strokeRect(-s / 2, -t / 2, s, t);
      ctx.beginPath();
      ctx.moveTo(0, -t / 2);
      ctx.lineTo(0, t / 2);
      ctx.stroke();
    } else {
      ctx.fillRect(-s / 2, -t / 2, s, t);
      ctx.strokeRect(-s / 2, -t / 2, s, t);
    }
  } else if (o.kind === "stairs") {
    const w = o.size;
    const step = w / o.steps;
    ctx.fillStyle = floorColor;
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = Math.max(1.5, doc.settings.wallThickness * 0.35);
    ctx.fillRect(-w / 2, -w / 2, w, w);
    ctx.strokeRect(-w / 2, -w / 2, w, w);
    ctx.beginPath();
    for (let i = 1; i < o.steps; i++) {
      const y = -w / 2 + i * step;
      ctx.moveTo(-w / 2, y);
      ctx.lineTo(w / 2, y);
    }
    ctx.stroke();
  } else if (o.kind === "pillar") {
    ctx.fillStyle = wallColor;
    ctx.beginPath();
    ctx.arc(0, 0, o.r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = inkColor;
    ctx.font = `600 ${o.size}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.text, 0, 0);
  }
  ctx.restore();
  void scale;
}

export type RenderOpts = {
  preview?: Shape | null;
  selectedIds?: string[];
  hideUi?: boolean;
  dpr?: number;
};

export function renderScene(
  ctx: CanvasRenderingContext2D,
  doc: Doc,
  view: View,
  w: number,
  h: number,
  opts: RenderOpts = {},
) {
  const dpr = opts.dpr ?? 1;
  const s = doc.settings;
  const pw = w * dpr;
  const ph = h * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, pw, ph);
  ctx.fillStyle = s.bgColor;
  ctx.fillRect(0, 0, pw, ph);

  const shapes = opts.preview ? [...doc.shapes, opts.preview] : doc.shapes;

  const mask = makeCanvas(pw, ph);
  const mc = mask.getContext("2d")!;
  applyView(mc, view, dpr);
  drawShapes(mc, shapes, "#ffffff");

  const wallPx = Math.max(0.5, s.wallThickness * view.scale * dpr);
  const wallC = makeCanvas(pw, ph);
  const wc = wallC.getContext("2d")!;
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    wc.drawImage(mask, Math.cos(a) * wallPx, Math.sin(a) * wallPx);
  }
  wc.drawImage(mask, 0, 0);
  wc.globalCompositeOperation = "source-in";
  wc.fillStyle = s.wallColor;
  wc.fillRect(0, 0, pw, ph);

  if (s.shadow) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 22 * dpr;
    ctx.shadowOffsetY = 8 * dpr;
    ctx.drawImage(wallC, 0, 0);
    ctx.restore();
  }
  ctx.drawImage(wallC, 0, 0);

  const floorC = makeCanvas(pw, ph);
  const fc = floorC.getContext("2d")!;
  fc.drawImage(mask, 0, 0);
  fc.globalCompositeOperation = "source-in";
  fc.fillStyle = s.floorColor;
  fc.fillRect(0, 0, pw, ph);
  fc.globalCompositeOperation = "source-over";
  drawGrid(fc, doc, { ...view, x: view.x, y: view.y }, pw / dpr, ph / dpr, dpr);
  ctx.drawImage(floorC, 0, 0);

  applyView(ctx, view, dpr);
  for (const o of doc.objects) drawObject(ctx, o, doc, view.scale);

  if (!opts.hideUi && opts.selectedIds?.length) {
    ctx.strokeStyle = "#4da3ff";
    ctx.lineWidth = 2 / view.scale;
    ctx.setLineDash([6 / view.scale, 4 / view.scale]);
    for (const id of opts.selectedIds) {
      const shape = doc.shapes.find((x) => x.id === id);
      if (shape) {
        tracePath(ctx, shape);
        ctx.stroke();
      }
      const obj = doc.objects.find((x) => x.id === id);
      if (obj) {
        const r = obj.kind === "pillar" ? obj.r + 4 : obj.kind === "text" ? obj.size : obj.size * 0.7;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function screenToWorld(p: Pt, view: View): Pt {
  return { x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale };
}
