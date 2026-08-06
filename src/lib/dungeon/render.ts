import { getImage } from "./assets";
import { fogTile, type FogStyle } from "./fogAssets";
import { cellPolygon, objectsInDrawOrder, objectRadius, type Doc, type MapObject, type Pt, type Shape, type View } from "./model";
import { lightSources, occluders, visibilityPolygon } from "./los";

export const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif';

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
  } else if (gridStyle === "hex") {
    // pointy-top hex lattice
    const R = gridSize / Math.sqrt(3);
    const colW = gridSize;
    const rowH = R * 1.5;
    ctx.beginPath();
    const c0 = Math.floor(x1 / colW) - 1;
    const c1 = Math.ceil(x2 / colW) + 1;
    const r0 = Math.floor(y1 / rowH) - 1;
    const r1 = Math.ceil(y2 / rowH) + 1;
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        const cx = col * colW + (row % 2 ? colW / 2 : 0);
        const cy = row * rowH;
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i - 30);
          const px = cx + Math.cos(a) * R;
          const py = cy + Math.sin(a) * R;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      }
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

/** Diagonal hand-drawn hatching, clipped to the wall band. */
function hatchWalls(wc: CanvasRenderingContext2D, doc: Doc, pw: number, ph: number, dpr: number, scale: number) {
  const gap = Math.max(3, doc.settings.hatchDensity) * scale * dpr;
  wc.save();
  wc.globalCompositeOperation = "source-atop";
  wc.strokeStyle = doc.settings.inkColor;
  wc.globalAlpha = 0.35;
  wc.lineWidth = Math.max(0.6, 0.9 * scale * dpr);
  wc.beginPath();
  for (let i = -ph; i < pw + ph; i += gap) {
    wc.moveTo(i, 0);
    wc.lineTo(i + ph, ph);
  }
  wc.stroke();
  wc.restore();
}


function label(ctx: CanvasRenderingContext2D, text: string, y: number, size: number, color: string) {
  if (!text) return;
  ctx.font = `600 ${size}px ${UI_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, 0, y);
}

export function drawObject(ctx: CanvasRenderingContext2D, o: MapObject, doc: Doc, processing: boolean = false) {
  const { wallColor, floorColor, inkColor } = doc.settings;
  ctx.save();

  if (processing) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.beginPath();
    ctx.arc(0, 0, objectRadius(o) + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#4da3ff";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  
  if (o.filter === "pixel") {
    ctx.imageSmoothingEnabled = false;
  } else if (o.filter === "toon") {
    ctx.filter = "contrast(1.4) saturate(1.8) brightness(1.1) drop-shadow(0 0 1px rgba(0,0,0,0.5))";
  } else if (o.filter === "remove-bg") {
    // Basic white-remover filter using contrast/brightness extremes
    // This works surprisingly well for black-on-white lineart
    ctx.filter = "contrast(100) brightness(1.2) grayscale(1)";
    ctx.globalCompositeOperation = "multiply";
  }

  ctx.translate(o.x, o.y);
  if (o.kind === "door" || o.kind === "stairs" || o.kind === "image") ctx.rotate(o.angle);
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
      ctx.font = `bold ${s * 0.55}px ${UI_FONT}`;
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
  } else if (o.kind === "npc") {
    ctx.fillStyle = o.color;
    ctx.strokeStyle = o.hostile ? "#2b0b0b" : "#0b1b2b";
    ctx.lineWidth = Math.max(1.5, o.r * 0.14);
    ctx.beginPath();
    ctx.arc(0, 0, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (o.hostile) {
      ctx.beginPath();
      ctx.arc(0, 0, o.r * 1.28, 0, Math.PI * 2);
      ctx.setLineDash([o.r * 0.4, o.r * 0.3]);
      ctx.strokeStyle = o.color;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    label(ctx, o.label || o.name || "", 0, o.r * 0.9, "#ffffff");
  } else if (o.kind === "item") {
    const s = o.size;
    ctx.fillStyle = o.color;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = Math.max(1.2, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -s / 2);
    ctx.lineTo(s / 2, 0);
    ctx.lineTo(0, s / 2);
    ctx.lineTo(-s / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    label(ctx, o.label || o.name || "", s * 0.95, s * 0.45, inkColor);
  } else if (o.kind === "trigger") {
    ctx.fillStyle = `${o.color}33`;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
    ctx.strokeRect(-o.w / 2, -o.h / 2, o.w, o.h);
    ctx.setLineDash([]);
    label(ctx, (o.label || o.name || o.trigger).toUpperCase(), 0, Math.max(10, Math.min(o.w, o.h) * 0.22), o.color);
  } else if (o.kind === "light") {
    ctx.strokeStyle = o.color;
    ctx.fillStyle = o.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
      ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15);
    }
    ctx.stroke();
  } else if (o.kind === "image") {
    const img = getImage(o.url);
    if (img) {
      if (o.filter === "pixel") {
        // Real pixelation by downscaling and upscaling
        const size = 64; // downscale to 64px
        const off = makeCanvas(size, size);
        const oc = off.getContext("2d")!;
        oc.imageSmoothingEnabled = false;
        oc.drawImage(img, 0, 0, size, size);
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, -o.w / 2, -o.h / 2, o.w, o.h);
        ctx.imageSmoothingEnabled = true;
      } else {
        ctx.drawImage(img, -o.w / 2, -o.h / 2, o.w, o.h);
      }
    } else {
      ctx.strokeStyle = inkColor;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(-o.w / 2, -o.h / 2, o.w, o.h);
      ctx.globalAlpha = 1;
    }
  } else {
    ctx.fillStyle = inkColor;
    ctx.font = `600 ${o.size}px ${UI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.text, 0, 0);
  }
  ctx.restore();
}

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return { r: 255, g: 220, b: 150 };
  return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16) };
}

/** Darkness + light pools + line-of-sight polygons. */
function drawLighting(ctx: CanvasRenderingContext2D, doc: Doc, view: View, w: number, h: number, dpr: number) {
  const s = doc.settings;
  if (!s.lighting && s.losMode === "off" && !s.playerView) return;
  const lights = lightSources(doc);
  if (!lights.length) return;
  const segs = occluders(doc);
  const pw = w * dpr;
  const ph = h * dpr;

  const fog = makeCanvas(pw, ph);
  const fc = fog.getContext("2d")!;
  fc.fillStyle = s.fogColor;
  fc.globalAlpha = 1 - Math.min(0.95, Math.max(0, s.ambient));
  fc.fillRect(0, 0, pw, ph);
  fc.globalAlpha = 1;

  // carve visible areas out of the fog
  fc.save();
  applyView(fc, view, dpr);
  fc.globalCompositeOperation = "destination-out";
  for (const l of lights) {
    if (l.kind !== "light") continue;
    const poly = visibilityPolygon({ x: l.x, y: l.y }, l.radius, segs);
    if (poly.length < 3) continue;
    const grad = fc.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.radius);
    const a = Math.min(1, Math.max(0.05, l.intensity));
    grad.addColorStop(0, `rgba(0,0,0,${a})`);
    grad.addColorStop(0.65, `rgba(0,0,0,${a * 0.8})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    fc.fillStyle = grad;
    fc.beginPath();
    poly.forEach((p, i) => (i === 0 ? fc.moveTo(p.x, p.y) : fc.lineTo(p.x, p.y)));
    fc.closePath();
    fc.fill();
  }
  fc.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(fog, 0, 0);

  if (!s.lighting) return;
  // warm colour wash for each light
  const glow = makeCanvas(pw, ph);
  const gc = glow.getContext("2d")!;
  applyView(gc, view, dpr);
  for (const l of lights) {
    if (l.kind !== "light") continue;
    const poly = visibilityPolygon({ x: l.x, y: l.y }, l.radius, segs);
    if (poly.length < 3) continue;
    const { r, g, b } = hexToRgb(l.color);
    const grad = gc.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.radius);
    grad.addColorStop(0, `rgba(${r},${g},${b},${Math.min(0.7, l.intensity * 0.55)})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    gc.fillStyle = grad;
    gc.beginPath();
    poly.forEach((p, i) => (i === 0 ? gc.moveTo(p.x, p.y) : gc.lineTo(p.x, p.y)));
    gc.closePath();
    gc.fill();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(glow, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

/** Fog of war cells. Solid for players, translucent for the GM. */
function drawFog(
  ctx: CanvasRenderingContext2D,
  doc: Doc,
  view: View,
  w: number,
  h: number,
  dpr: number,
  forPlayers: boolean,
) {
  if (!doc.fog.length) return;
  const s = doc.settings;
  const pw = Math.max(1, w * dpr);
  const ph = Math.max(1, h * dpr);
  const soft = Math.max(0, Math.min(1, s.fogSoftness ?? 0.45));
  const blur = soft * Math.max(6, s.gridSize * view.scale * dpr * 0.42);

  // 1. cell mask (blurred for feathered edges)
  const mask = makeCanvas(pw, ph);
  const mc = mask.getContext("2d")!;
  if (blur > 0.5) mc.filter = `blur(${blur.toFixed(2)}px)`;
  mc.save();
  applyView(mc, view, dpr);
  mc.fillStyle = "#000";
  mc.beginPath();
  for (const key of doc.fog) {
    const poly = cellPolygon(key, s);
    poly.forEach((p, i) => (i === 0 ? mc.moveTo(p.x, p.y) : mc.lineTo(p.x, p.y)));
    mc.closePath();
  }
  mc.fill();
  mc.restore();
  mc.filter = "none";

  // 2. paint the 2D fog asset through the mask
  const style = (s.fogStyle ?? "cloud") as FogStyle;
  const layer = makeCanvas(pw, ph);
  const lc = layer.getContext("2d")!;
  if (style === "solid") {
    lc.fillStyle = s.fogColor;
    lc.fillRect(0, 0, pw, ph);
  } else {
    const tile = fogTile(style, s.fogColor);
    const pattern = lc.createPattern(tile, "repeat");
    lc.fillStyle = s.fogColor;
    lc.fillRect(0, 0, pw, ph);
    if (pattern) {
      const scale = Math.max(0.25, (s.fogScale ?? 1) * view.scale * dpr);
      const drift = style === "smoke" ? 0.35 : 0;
      pattern.setTransform(new DOMMatrix().translateSelf(view.x * dpr, view.y * dpr).scaleSelf(scale).rotateSelf(drift * 30));
      lc.fillStyle = pattern;
      lc.fillRect(0, 0, pw, ph);
    }
  }
  lc.globalCompositeOperation = "destination-in";
  lc.drawImage(mask, 0, 0);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = forPlayers ? 1 : Math.max(0.15, Math.min(1, s.fogGmOpacity ?? 0.58));
  ctx.drawImage(layer, 0, 0);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export type RenderOpts = {
  preview?: Shape | null;
  selectedIds?: string[];
  processingIds?: string[];
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
  if (s.hatch) hatchWalls(wc, doc, pw, ph, dpr, view.scale);

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
  drawGrid(fc, doc, view, pw / dpr, ph / dpr, dpr);
  ctx.drawImage(floorC, 0, 0);

  applyView(ctx, view, dpr);
  const layerById = new Map(doc.layers.map((l) => [l.id, l]));
  for (const o of objectsInDrawOrder(doc)) {
    const layer = layerById.get(o.layerId);
    if (layer && !layer.visible) continue;
    if (s.playerView && layer?.gmOnly) continue;
    if (o.kind === "light" && (opts.hideUi || s.playerView)) continue;
    ctx.globalAlpha = layer?.opacity ?? 1;
    drawObject(ctx, o, doc);
    ctx.globalAlpha = 1;
  }

  drawFog(ctx, doc, view, w, h, dpr, !!s.playerView || !!opts.hideUi);
  drawLighting(ctx, doc, view, w, h, dpr);

  if (!opts.hideUi && opts.selectedIds?.length) {
    applyView(ctx, view, dpr);
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
        if (obj.kind === "trigger") {
          ctx.strokeRect(obj.x - obj.w / 2 - 3, obj.y - obj.h / 2 - 3, obj.w + 6, obj.h + 6);
        } else {
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, objectRadius(obj) + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (obj.kind === "light") {
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function screenToWorld(p: Pt, view: View): Pt {
  return { x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale };
}
