export type Pt = { x: number; y: number };

export type ShapeBase = { id: string; erase: boolean };
export type Shape =
  | (ShapeBase & { kind: "rect"; a: Pt; b: Pt })
  | (ShapeBase & { kind: "ellipse"; a: Pt; b: Pt })
  | (ShapeBase & { kind: "poly"; pts: Pt[] })
  | (ShapeBase & { kind: "path"; pts: Pt[]; width: number });

export type DoorVariant = "door" | "double" | "secret" | "archway";

export type MapObject =
  | { id: string; kind: "door"; x: number; y: number; angle: number; size: number; variant: DoorVariant }
  | { id: string; kind: "stairs"; x: number; y: number; angle: number; size: number; steps: number }
  | { id: string; kind: "pillar"; x: number; y: number; r: number }
  | { id: string; kind: "text"; x: number; y: number; text: string; size: number };

export type GridStyle = "square" | "dot" | "none";

export type Settings = {
  gridSize: number;
  gridStyle: GridStyle;
  snap: boolean;
  wallThickness: number;
  bgColor: string;
  floorColor: string;
  wallColor: string;
  gridColor: string;
  inkColor: string;
  shadow: boolean;
};

export type Doc = {
  shapes: Shape[];
  objects: MapObject[];
  settings: Settings;
};

export type View = { x: number; y: number; scale: number };

export const THEMES: Record<string, Partial<Settings> & { label: string }> = {
  classic: {
    label: "Classic Ink",
    bgColor: "#1b1d21",
    floorColor: "#f4efe3",
    wallColor: "#16181b",
    gridColor: "#c9c0ac",
    inkColor: "#16181b",
  },
  parchment: {
    label: "Parchment",
    bgColor: "#3b3327",
    floorColor: "#e8d8b5",
    wallColor: "#4a3b28",
    gridColor: "#c2ad84",
    inkColor: "#4a3b28",
  },
  blueprint: {
    label: "Blueprint",
    bgColor: "#0d1f33",
    floorColor: "#123a5c",
    wallColor: "#9ed0ff",
    gridColor: "#5c9ad1",
    inkColor: "#d6ecff",
  },
  cave: {
    label: "Deep Cave",
    bgColor: "#0f0f12",
    floorColor: "#2b2f36",
    wallColor: "#8e9aa8",
    gridColor: "#454c56",
    inkColor: "#d8dee6",
  },
};

export const DEFAULT_SETTINGS: Settings = {
  gridSize: 32,
  gridStyle: "square",
  snap: true,
  wallThickness: 6,
  shadow: true,
  bgColor: "#1b1d21",
  floorColor: "#f4efe3",
  wallColor: "#16181b",
  gridColor: "#c9c0ac",
  inkColor: "#16181b",
};

let counter = 0;
export function uid(prefix = "id") {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function emptyDoc(): Doc {
  return { shapes: [], objects: [], settings: { ...DEFAULT_SETTINGS } };
}

export function snapVal(v: number, grid: number, on: boolean) {
  return on ? Math.round(v / grid) * grid : v;
}

export function snapPt(p: Pt, grid: number, on: boolean): Pt {
  return { x: snapVal(p.x, grid, on), y: snapVal(p.y, grid, on) };
}

export function shapePoints(s: Shape): Pt[] {
  return s.kind === "poly" || s.kind === "path" ? s.pts : [s.a, s.b];
}

export function translateShape(s: Shape, dx: number, dy: number): Shape {
  if (s.kind === "poly" || s.kind === "path") {
    return { ...s, pts: s.pts.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
  }
  return { ...s, a: { x: s.a.x + dx, y: s.a.y + dy }, b: { x: s.b.x + dx, y: s.b.y + dy } };
}

function distToSeg(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

export function pointInShape(p: Pt, s: Shape): boolean {
  if (s.kind === "rect") {
    const x1 = Math.min(s.a.x, s.b.x);
    const x2 = Math.max(s.a.x, s.b.x);
    const y1 = Math.min(s.a.y, s.b.y);
    const y2 = Math.max(s.a.y, s.b.y);
    return p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2;
  }
  if (s.kind === "ellipse") {
    const cx = (s.a.x + s.b.x) / 2;
    const cy = (s.a.y + s.b.y) / 2;
    const rx = Math.abs(s.b.x - s.a.x) / 2 || 1;
    const ry = Math.abs(s.b.y - s.a.y) / 2 || 1;
    return ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2 <= 1;
  }
  if (s.kind === "path") {
    for (let i = 1; i < s.pts.length; i++) {
      if (distToSeg(p, s.pts[i - 1]!, s.pts[i]!) <= s.width / 2 + 2) return true;
    }
    return s.pts.length === 1 ? Math.hypot(p.x - s.pts[0]!.x, p.y - s.pts[0]!.y) <= s.width / 2 : false;
  }
  let inside = false;
  const pts = s.pts;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const pi = pts[i]!;
    const pj = pts[j]!;
    const hit = pi.y > p.y !== pj.y > p.y && p.x < ((pj.x - pi.x) * (p.y - pi.y)) / (pj.y - pi.y) + pi.x;
    if (hit) inside = !inside;
  }
  return inside;
}

export function objectHit(p: Pt, o: MapObject): boolean {
  if (o.kind === "text") return Math.hypot(p.x - o.x, p.y - o.y) <= Math.max(20, o.size);
  if (o.kind === "pillar") return Math.hypot(p.x - o.x, p.y - o.y) <= o.r + 4;
  return Math.hypot(p.x - o.x, p.y - o.y) <= o.size * 0.7;
}

export function docBounds(doc: Doc): { x1: number; y1: number; x2: number; y2: number } | null {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  const add = (p: Pt, pad = 0) => {
    x1 = Math.min(x1, p.x - pad);
    y1 = Math.min(y1, p.y - pad);
    x2 = Math.max(x2, p.x + pad);
    y2 = Math.max(y2, p.y + pad);
  };
  doc.shapes.forEach((s) => shapePoints(s).forEach((p) => add(p, s.kind === "path" ? s.width / 2 : 0)));
  doc.objects.forEach((o) => add({ x: o.x, y: o.y }, o.kind === "pillar" ? o.r : 30));
  if (!isFinite(x1)) return null;
  return { x1, y1, x2, y2 };
}
