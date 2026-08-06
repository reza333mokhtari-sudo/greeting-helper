import type { FogStyle } from "./fogAssets";

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
  filter?: "none" | "pixel" | "toon" | "remove-bg";
};

export type MapObject =
  | (ObjCommon & { kind: "door"; x: number; y: number; angle: number; size: number; variant: DoorVariant; blocksLight?: boolean })
  | (ObjCommon & { kind: "stairs"; x: number; y: number; angle: number; size: number; steps: number })
  | (ObjCommon & { kind: "pillar"; x: number; y: number; r: number })
  | (ObjCommon & { kind: "text"; x: number; y: number; text: string; size: number })
  | (ObjCommon & { kind: "npc"; x: number; y: number; r: number; color: string; label: string; hostile: boolean })
  | (ObjCommon & { kind: "item"; x: number; y: number; size: number; color: string; label: string })
  | (ObjCommon & { kind: "trigger"; x: number; y: number; w: number; h: number; color: string; trigger: TriggerKind; label: string })
  | (ObjCommon & { kind: "light"; x: number; y: number; radius: number; color: string; intensity: number })
  | (ObjCommon & { kind: "image"; x: number; y: number; w: number; h: number; angle: number; url: string });

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
  /** 2D fog asset style used to paint hidden cells. */
  fogStyle: FogStyle;
  /** Feathered edge amount, 0..1. */
  fogSoftness: number;
  /** How opaque fog looks to the GM, 0..1 (players always see it solid). */
  fogGmOpacity: number;
  /** Texture scale multiplier for the fog asset. */
  fogScale: number;
  /** Graphics quality preset. */
  qualityPreset: "low" | "medium" | "high" | "ultra";
  /** Performance & rendering toggles. */
  renderScale: number;
  antiAliasing: boolean;
  maxTextureSize: number;
  maxDrawDistance: number;
  /** Camera mode settings. */
  cameraMode: boolean;
  cameraFov: number;
  cameraSensitivity: number;
  cameraDamping: number;
  cameraInvertY: boolean;
  cameraProjection: "perspective" | "orthographic";
  showAxes: boolean;
  cameraYaw: number;
  cameraPitch: number;
  cameraDistance: number;
  cameraTarget: Pt;
};

export type Object3D = {
  id: string;
  name: string;
  url: string; // .glb or .gltf
  x: number;
  y: number;
  z: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
  layerId: string;
};


/** A single level of a multi-floor map (RE4-style floor stack). */
export type Floor = {
  id: string;
  name: string;
  shapes: Shape[];
  objects: MapObject[];
  fog: string[];
};

export type FloorLinkKind = "stairs" | "elevator" | "ladder" | "hatch" | "door";

/** A connection between two floors (e.g. stairs from Ground to 1F). */
export type FloorLink = {
  id: string;
  from: string;
  to: string;
  kind: FloorLinkKind;
  label: string;
};

export type Doc = {
  shapes: Shape[];
  objects: MapObject[];
  layers: Layer[];
  settings: Settings;
  /** Fog of war: keys of grid cells that are hidden from players. */
  fog: string[];
  /** Ordered top-to-bottom stack of floors; the active one mirrors the fields above. */
  floors: Floor[];
  activeFloorId: string;
  /** 3D objects placed in the world. */
  objects3d: Object3D[];
  /** Connections between floors. */
  links: FloorLink[];
  /** Show the floor directly below as a faint ghost underlay. */
  showUnderlay?: boolean;
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
  fogStyle: "cloud",
  fogSoftness: 0.45,
  fogGmOpacity: 0.58,
  fogScale: 1,
  qualityPreset: "medium",
  renderScale: 1,
  antiAliasing: true,
  maxTextureSize: 2048,
  maxDrawDistance: 5000,
  cameraMode: false,
  cameraFov: 60,
  cameraSensitivity: 1,
  cameraDamping: 0.1,
  cameraInvertY: false,
  cameraProjection: "perspective",
  showAxes: true,
  cameraYaw: 45,
  cameraPitch: 45,
  cameraDistance: 1000,
  cameraTarget: { x: 0, y: 0 },
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
export const LAYER_PROP = "layer_prop";

export function defaultLayers(): Layer[] {
  const mk = (id: string, name: string, gmOnly = false): Layer => ({ id, name, visible: true, locked: false, opacity: 1, gmOnly });
  return [
    mk(LAYER_STRUCTURE, "Structure"),
    mk(LAYER_PROP, "Props"),
    mk(LAYER_TRIGGER, "Triggers", true),
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
  image: LAYER_PROP,
};

export function emptyDoc(): Doc {
  const floorId = uid("floor");
  return {
    shapes: [],
    objects: [],
    objects3d: [],
    layers: defaultLayers(),
    settings: { ...DEFAULT_SETTINGS },
    fog: [],
    floors: [{ id: floorId, name: "Ground floor", shapes: [], objects: [], fog: [] }],
    activeFloorId: floorId,
    links: [],
    showUnderlay: true,
  };
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
  const shapes = input.shapes ?? [];
  const fog = Array.isArray(input.fog) ? input.fog : [];

  const floors: Floor[] =
    Array.isArray(input.floors) && input.floors.length
      ? input.floors.map((f) => ({
          id: f.id ?? uid("floor"),
          name: f.name ?? "Floor",
          shapes: Array.isArray(f.shapes) ? f.shapes : [],
          objects: Array.isArray(f.objects) ? f.objects : [],
          fog: Array.isArray(f.fog) ? f.fog : [],
        }))
      : [{ id: uid("floor"), name: "Ground floor", shapes, objects, fog }];
  const activeFloorId = floors.some((f) => f.id === input.activeFloorId) ? input.activeFloorId! : floors[0]!.id;

  const doc: Doc = {
    shapes,
    objects,
    objects3d: Array.isArray(input.objects3d) ? input.objects3d : [],
    layers,
    settings: { ...base.settings, ...(input.settings ?? {}) },
    fog,
    floors,
    activeFloorId,
    links: (Array.isArray(input.links) ? input.links : []).filter(
      (l) => floors.some((f) => f.id === l.from) && floors.some((f) => f.id === l.to),
    ),
    showUnderlay: input.showUnderlay ?? true,
  };
  // The top-level fields are the source of truth for the active floor.
  return syncActiveFloor(doc);
}

/* ------------------------------------------------------------------ */
/* Floor stack helpers                                                 */
/* ------------------------------------------------------------------ */

/** Copy the live (top-level) content back into the active floor entry. */
export function syncActiveFloor(d: Doc): Doc {
  return {
    ...d,
    floors: d.floors.map((f) => (f.id === d.activeFloorId ? { ...f, shapes: d.shapes, objects: d.objects, fog: d.fog } : f)),
  };
}

export function activeFloor(d: Doc): Floor | undefined {
  return d.floors.find((f) => f.id === d.activeFloorId);
}

/** Stash the current floor and load another one into the live document. */
export function switchFloor(d: Doc, id: string): Doc {
  if (id === d.activeFloorId) return d;
  const synced = syncActiveFloor(d);
  const target = synced.floors.find((f) => f.id === id);
  if (!target) return d;
  return { ...synced, activeFloorId: id, shapes: target.shapes, objects: target.objects, fog: target.fog };
}

/** Insert a new floor above the active one, optionally duplicating its content. */
export function addFloor(d: Doc, name?: string, duplicate = false): Doc {
  const synced = syncActiveFloor(d);
  const src = synced.floors.find((f) => f.id === synced.activeFloorId);
  const floor: Floor = {
    id: uid("floor"),
    name: name?.trim() || `Floor ${synced.floors.length + 1}`,
    shapes: duplicate && src ? src.shapes.map((s) => ({ ...s, id: uid("s") })) : [],
    objects: duplicate && src ? src.objects.map((o) => ({ ...o, id: uid("o") })) : [],
    fog: duplicate && src ? [...src.fog] : [],
  };
  const at = Math.max(0, synced.floors.findIndex((f) => f.id === synced.activeFloorId));
  const floors = [...synced.floors];
  floors.splice(at, 0, floor);
  return { ...synced, floors, activeFloorId: floor.id, shapes: floor.shapes, objects: floor.objects, fog: floor.fog };
}

export function renameFloor(d: Doc, id: string, name: string): Doc {
  return { ...d, floors: d.floors.map((f) => (f.id === id ? { ...f, name } : f)) };
}

export function deleteFloor(d: Doc, id: string): Doc {
  if (d.floors.length <= 1) return d;
  const synced = syncActiveFloor(d);
  const floors = synced.floors.filter((f) => f.id !== id);
  const links = synced.links.filter((l) => l.from !== id && l.to !== id);
  if (id !== synced.activeFloorId) return { ...synced, floors, links };
  const next = floors[0]!;
  return { ...synced, floors, links, activeFloorId: next.id, shapes: next.shapes, objects: next.objects, fog: next.fog };
}

/** Move a floor up (-1) or down (+1) in the stack. */
export function moveFloor(d: Doc, id: string, dir: -1 | 1): Doc {
  const i = d.floors.findIndex((f) => f.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= d.floors.length) return d;
  const floors = [...d.floors];
  [floors[i], floors[j]] = [floors[j]!, floors[i]!];
  return { ...d, floors };
}

export function addFloorLink(d: Doc, link: Omit<FloorLink, "id">): Doc {
  if (link.from === link.to) return d;
  return { ...d, links: [...d.links, { ...link, id: uid("link") }] };
}

export function removeFloorLink(d: Doc, id: string): Doc {
  return { ...d, links: d.links.filter((l) => l.id !== id) };
}

/** The floor rendered as a ghost underlay (the one directly below the active floor). */
export function floorBelow(d: Doc): Floor | undefined {
  const i = d.floors.findIndex((f) => f.id === d.activeFloorId);
  return i >= 0 ? d.floors[i + 1] : undefined;
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
  if (o.kind === "image") {
    return p.x >= o.x - o.w / 2 && p.x <= o.x + o.w / 2 && p.y >= o.y - o.h / 2 && p.y <= o.y + o.h / 2;
  }
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
    case "image":
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

/** Vertices of a regular polygon (or circle when `sides` is large). */
export function regularPolygon(center: Pt, edge: Pt, sides: number, drawTo: "point" | "edge"): Pt[] {
  const n = Math.max(3, Math.round(sides));
  const r = Math.max(1, Math.hypot(edge.x - center.x, edge.y - center.y));
  const step = (Math.PI * 2) / n;
  // "edge" means the drag point sits on the middle of a face, not on a corner
  const radius = drawTo === "edge" ? r / Math.cos(step / 2) : r;
  const base = Math.atan2(edge.y - center.y, edge.x - center.x) + (drawTo === "edge" ? step / 2 : 0);
  return Array.from({ length: n }, (_, i) => ({
    x: center.x + Math.cos(base + i * step) * radius,
    y: center.y + Math.sin(base + i * step) * radius,
  }));
}

/** Hand-drawn wobble: subdivide each edge and jitter the points. */
export function roughenPoly(pts: Pt[], amount: number, seedKey = 1): Pt[] {
  if (amount <= 0 || pts.length < 2) return pts;
  const rnd = (i: number) => {
    const x = Math.sin((i + 1) * 12.9898 + seedKey * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  };
  const out: Pt[] = [];
  let k = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.round(len / 22));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push({
        x: a.x + (b.x - a.x) * t + rnd(k++) * amount,
        y: a.y + (b.y - a.y) * t + rnd(k++) * amount,
      });
    }
  }
  return out;
}


/* ------------------------------------------------------------------ */
/* Fog of war cell geometry (square / dot grids and pointy-top hexes)  */
/* ------------------------------------------------------------------ */

function hexMetrics(g: number) {
  const R = g / Math.sqrt(3);
  return { R, colW: g, rowH: R * 1.5 };
}

/** Centre point of a hex cell in the same lattice the grid renderer uses. */
function hexCenter(col: number, row: number, g: number): Pt {
  const { colW, rowH } = hexMetrics(g);
  return { x: col * colW + (((row % 2) + 2) % 2 ? colW / 2 : 0), y: row * rowH };
}

/** Key of the grid cell containing a world point. */
export function cellKeyAt(p: Pt, s: Settings): string {
  const g = s.gridSize;
  if (s.gridStyle === "hex") {
    const { colW, rowH } = hexMetrics(g);
    const row0 = Math.round(p.y / rowH);
    let best = "";
    let bestD = Infinity;
    for (let row = row0 - 1; row <= row0 + 1; row++) {
      const col0 = Math.round((p.x - (((row % 2) + 2) % 2 ? colW / 2 : 0)) / colW);
      for (let col = col0 - 1; col <= col0 + 1; col++) {
        const c = hexCenter(col, row, g);
        const d = Math.hypot(c.x - p.x, c.y - p.y);
        if (d < bestD) {
          bestD = d;
          best = `${col}:${row}`;
        }
      }
    }
    return best;
  }
  return `${Math.floor(p.x / g)}:${Math.floor(p.y / g)}`;
}

/** Outline of a cell so the renderer can fill it. */
export function cellPolygon(key: string, s: Settings): Pt[] {
  const [c, r] = key.split(":");
  const col = Number(c);
  const row = Number(r);
  const g = s.gridSize;
  if (s.gridStyle === "hex") {
    const { R } = hexMetrics(g);
    const ctr = hexCenter(col, row, g);
    return Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return { x: ctr.x + Math.cos(a) * R, y: ctr.y + Math.sin(a) * R };
    });
  }
  const x = col * g;
  const y = row * g;
  return [
    { x, y },
    { x: x + g, y },
    { x: x + g, y: y + g },
    { x, y: y + g },
  ];
}

export function cellCenter(key: string, s: Settings): Pt {
  const pts = cellPolygon(key, s);
  const n = pts.length;
  return { x: pts.reduce((a, p) => a + p.x, 0) / n, y: pts.reduce((a, p) => a + p.y, 0) / n };
}

/** Every cell whose centre falls inside the axis-aligned rectangle. */
export function cellsInRect(a: Pt, b: Pt, s: Settings): string[] {
  const g = s.gridSize;
  const x1 = Math.min(a.x, b.x);
  const x2 = Math.max(a.x, b.x);
  const y1 = Math.min(a.y, b.y);
  const y2 = Math.max(a.y, b.y);
  const step = s.gridStyle === "hex" ? g / 2.4 : g / 2;
  const out = new Set<string>();
  for (let x = x1; x <= x2 + step; x += step) {
    for (let y = y1; y <= y2 + step; y += step) {
      const k = cellKeyAt({ x: Math.min(x, x2), y: Math.min(y, y2) }, s);
      const c = cellCenter(k, s);
      if (c.x >= x1 && c.x <= x2 && c.y >= y1 && c.y <= y2) out.add(k);
    }
  }
  return [...out];
}

/** Every cell whose centre is within `r` of `p` — the fog brush. */
export function cellsInRadius(p: Pt, r: number, s: Settings): string[] {
  const step = s.gridSize / 2.4;
  const out = new Set<string>();
  for (let x = p.x - r; x <= p.x + r; x += step) {
    for (let y = p.y - r; y <= p.y + r; y += step) {
      if (Math.hypot(x - p.x, y - p.y) > r) continue;
      const k = cellKeyAt({ x, y }, s);
      const c = cellCenter(k, s);
      if (Math.hypot(c.x - p.x, c.y - p.y) <= r + s.gridSize * 0.5) out.add(k);
    }
  }
  return [...out];
}

/** All cells covering the drawn map — used by "hide everything". */
export function allMapCells(doc: Doc): string[] {
  const b = docBounds(doc);
  if (!b) return [];
  const pad = doc.settings.gridSize;
  return cellsInRect({ x: b.x1 - pad, y: b.y1 - pad }, { x: b.x2 + pad, y: b.y2 + pad }, doc.settings);
}
