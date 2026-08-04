export type Pt = { x: number; y: number };

export type ShapeBase = { id: string; erase: boolean };
export type Shape =
  | (ShapeBase & { kind: "rect"; a: Pt; b: Pt })
  | (ShapeBase & { kind: "ellipse"; a: Pt; b: Pt })
  | (ShapeBase & { kind: "poly"; pts: Pt[] })
  | (ShapeBase & { kind: "path"; pts: Pt[]; width: number });

export type DoorVariant = "door" | "double" | "secret" | "archway";
export type TriggerKind = "trap" | "encounter" | "script" | "portal" | "note";

export type CustomProp = { key: string; value: string };

export type ObjCommon = {
  id: string;
  layerId: string;
  name?: string;
  notes?: string;
  props?: CustomProp[];
};

export type MapObject =
  | (ObjCommon & { kind: "door"; x: number; y: number; angle: number; size: number; variant: DoorVariant; blocksLight?: boolean })
  | (ObjCommon & { kind: "stairs"; x: number; y: number; angle: number; size: number; steps: number })
  | (ObjCommon & { kind: "pillar"; x: number; y: number; r: number })
  | (ObjCommon & { kind: "text"; x: number; y: number; text: string; size: number })
  | (ObjCommon & { kind: "npc"; x: number; y: number; r: number; color: string; label: string; hostile: boolean })
  | (ObjCommon & { kind: "item"; x: number; y: number; size: number; color: string; label: string })
  | (ObjCommon & { kind: "trigger"; x: number; y: number; w: number; h: number; color: string; trigger: TriggerKind; label: string })
  | (ObjCommon & { kind: "light"; x: number; y: number; radius: number; color: string; intensity: number });

export type ObjectKind = MapObject["kind"];

export type GridStyle = "square" | "dot" | "hex" | "none";

export type Layer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  /** Hidden in Player View (GM-only content such as traps and secret notes). */
  gmOnly?: boolean;
};

/** Options for the Circle / Regular polygon tool. */
export type NgonOpts = {
  mode: "draw" | "erase";
  snap: boolean;
  division: 1 | 2;
  rough: boolean;
  sides: number;
  drawTo: "point" | "edge";
};

export const DEFAULT_NGON: NgonOpts = {
  mode: "draw",
  snap: true,
  division: 1,
  rough: false,
  sides: 6,
  drawTo: "point",
};

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
  /** Classic Scrawl hand-drawn hatching inside the wall band. */
  hatch: boolean;
  hatchDensity: number;
  /** Hand-drawn wobble applied to newly drawn shapes. */
  roughness: number;
  /** Hide GM-only layers and force fog of war. */
  playerView: boolean;
  lighting: boolean;
  losMode: "off" | "lights" | "vision";
  ambient: number; // 0..1 how visible unlit areas are
  fogColor: string;
};


export type Doc = {
  shapes: Shape[];
  objects: MapObject[];
  layers: Layer[];
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
  hatch: true,
  hatchDensity: 7,
  roughness: 0,
  playerView: false,
  bgColor: "#1b1d21",
  floorColor: "#f4efe3",
  wallColor: "#16181b",
  gridColor: "#c9c0ac",
  inkColor: "#16181b",
  lighting: false,
  losMode: "off",
  ambient: 0.18,
  fogColor: "#05070c",
};

let counter = 0;
export function uid(prefix = "id") {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export const LAYER_STRUCTURE = "layer_structure";
export const LAYER_NPC = "layer_npc";
export const LAYER_ITEM = "layer_item";
export const LAYER_TRIGGER = "layer_trigger";
export const LAYER_LIGHT = "layer_light";

export function defaultLayers(): Layer[] {
  const mk = (id: string, name: string): Layer => ({ id, name, visible: true, locked: false, opacity: 1 });
  return [
    mk(LAYER_STRUCTURE, "Structure"),
    mk(LAYER_TRIGGER, "Triggers"),
    mk(LAYER_ITEM, "Items"),
    mk(LAYER_NPC, "NPCs"),
    mk(LAYER_LIGHT, "Lighting"),
  ];
}

export const DEFAULT_LAYER_FOR: Record<ObjectKind, string> = {
  door: LAYER_STRUCTURE,
  stairs: LAYER_STRUCTURE,
  pillar: LAYER_STRUCTURE,
  text: LAYER_STRUCTURE,
  npc: LAYER_NPC,
  item: LAYER_ITEM,
  trigger: LAYER_TRIGGER,
  light: LAYER_LIGHT,
};

export function emptyDoc(): Doc {
  return { shapes: [], objects: [], layers: defaultLayers(), settings: { ...DEFAULT_SETTINGS } };
}

/** Bring older/imported documents up to the current schema. */
export function migrateDoc(input: Partial<Doc> | null | undefined): Doc {
  const base = emptyDoc();
  if (!input) return base;
  const layers = Array.isArray(input.layers) && input.layers.length ? input.layers : base.layers;
  const ids = new Set(layers.map((l) => l.id));
  const objects = (input.objects ?? []).map((o) => ({
    ...o,
    layerId: o.layerId && ids.has(o.layerId) ? o.layerId : DEFAULT_LAYER_FOR[o.kind] ?? layers[0]!.id,
  })) as MapObject[];
  return {
    shapes: input.shapes ?? [],
    objects,
    layers,
    settings: { ...base.settings, ...(input.settings ?? {}) },
  };
}

export function layerOf(doc: Doc, o: MapObject): Layer | undefined {
  return doc.layers.find((l) => l.id === o.layerId);
}

export function objectsInDrawOrder(doc: Doc): MapObject[] {
  const order = new Map(doc.layers.map((l, i) => [l.id, i]));
  return [...doc.objects]
    .map((o, i) => ({ o, i }))
    .sort((a, b) => (order.get(a.o.layerId) ?? 0) - (order.get(b.o.layerId) ?? 0) || a.i - b.i)
    .map((x) => x.o);
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
  if (o.kind === "npc") return Math.hypot(p.x - o.x, p.y - o.y) <= o.r + 4;
  if (o.kind === "item") return Math.hypot(p.x - o.x, p.y - o.y) <= o.size * 0.7;
  if (o.kind === "light") return Math.hypot(p.x - o.x, p.y - o.y) <= 14;
  if (o.kind === "trigger") {
    return p.x >= o.x - o.w / 2 && p.x <= o.x + o.w / 2 && p.y >= o.y - o.h / 2 && p.y <= o.y + o.h / 2;
  }
  return Math.hypot(p.x - o.x, p.y - o.y) <= o.size * 0.7;
}

export function objectRadius(o: MapObject): number {
  switch (o.kind) {
    case "pillar":
      return o.r;
    case "npc":
      return o.r;
    case "text":
      return o.size;
    case "item":
      return o.size * 0.7;
    case "light":
      return 14;
    case "trigger":
      return Math.max(o.w, o.h) / 2;
    default:
      return o.size * 0.7;
  }
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
  doc.objects.forEach((o) => add({ x: o.x, y: o.y }, Math.max(30, objectRadius(o))));
  if (!isFinite(x1)) return null;
  return { x1, y1, x2, y2 };
}
