import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { SidePanel } from "./SidePanel";
import { Toolbar, TOOLS, type ToolId } from "./Toolbar";
import {
  DEFAULT_LAYER_FOR,
  DEFAULT_NGON,
  docBounds,
  emptyDoc,
  migrateDoc,
  objectHit,
  pointInShape,
  regularPolygon,
  roughenPoly,
  snapPt,
  snapVal,
  translateShape,
  uid,
  type Doc,
  type DoorVariant,
  type Layer,
  type MapObject,
  type NgonOpts,
  type Pt,
  type Settings,
  type Shape,
  type View,
} from "@/lib/dungeon/model";
import { exportPdfFile, exportSvgFile } from "@/lib/dungeon/exporters";
import { renderScene, screenToWorld } from "@/lib/dungeon/render";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "dungeon-scrawl-doc-v1";
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 8;

type Drag =
  | { mode: "none" }
  | { mode: "pan"; startX: number; startY: number; ox: number; oy: number }
  | { mode: "draw"; start: Pt }
  | { mode: "stroke" }
  | { mode: "move"; last: Pt; moved: boolean }
  | { mode: "place"; id: string; origin: Pt };

export function DungeonEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [doc, setDocState] = useState<Doc>(() => emptyDoc());
  const [past, setPast] = useState<Doc[]>([]);
  const [future, setFuture] = useState<Doc[]>([]);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [tool, setTool] = useState<ToolId>("rect");
  const [preview, setPreview] = useState<Shape | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [polyPts, setPolyPts] = useState<Pt[]>([]);
  const [brushWidth, setBrushWidth] = useState(48);
  const [doorVariant, setDoorVariant] = useState<DoorVariant>("door");
  const [ngon, setNgon] = useState<NgonOpts>(DEFAULT_NGON);
  const [cursor, setCursor] = useState<Pt>({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string>(() => emptyDoc().layers[0]!.id);

  const drag = useRef<Drag>({ mode: "none" });
  const stateRef = useRef({ doc, view, tool, polyPts, brushWidth, doorVariant, selected, spaceDown });
  stateRef.current = { doc, view, tool, polyPts, brushWidth, doorVariant, selected, spaceDown };


  const commit = useCallback((next: Doc | ((d: Doc) => Doc)) => {
    setDocState((prev) => {
      const value = typeof next === "function" ? (next as (d: Doc) => Doc)(prev) : next;
      if (value === prev) return prev;
      setPast((p) => [...p.slice(-80), prev]);
      setFuture([]);
      return value;
    });
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setDocState((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1]!;
      setDocState((cur) => {
        setFuture((f) => [cur, ...f].slice(0, 80));
        return prev;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0]!;
      setDocState((cur) => {
        setPast((p) => [...p, cur]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  // load / autosave
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Doc>;
        if (parsed && Array.isArray(parsed.shapes)) {
          const migrated = migrateDoc(parsed);
          setDocState(migrated);
          setActiveLayer(migrated.layers[0]!.id);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);


  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [doc]);

  // canvas sizing + draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const livePreview: Shape | null =
      preview ??
      (polyPts.length
        ? { id: "poly-preview", kind: "poly", erase: false, pts: [...polyPts, cursor] }
        : null);
    renderScene(ctx, doc, view, w, h, { preview: livePreview, selectedIds: selected, dpr });

    if (polyPts.length) {
      ctx.save();
      ctx.setTransform(view.scale * dpr, 0, 0, view.scale * dpr, view.x * dpr, view.y * dpr);
      ctx.strokeStyle = "#4da3ff";
      ctx.fillStyle = "#4da3ff";
      ctx.lineWidth = 1.5 / view.scale;
      polyPts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 / view.scale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }, [doc, view, preview, selected, polyPts, cursor]);

  useEffect(() => {
    let raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  // wheel zoom (non-passive)
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      setView((v) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * Math.exp(-dy * 0.0015)));
        const k = next / v.scale;
        return { scale: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = useCallback((dir: 1 | -1) => {
    const el = wrapRef.current;
    const px = (el?.clientWidth ?? 0) / 2;
    const py = (el?.clientHeight ?? 0) / 2;
    setView((v) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * (dir === 1 ? 1.25 : 0.8)));
      const k = next / v.scale;
      return { scale: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const fit = useCallback(() => {
    const el = wrapRef.current;
    const b = docBounds(doc);
    if (!el || !b) return;
    const pad = 80;
    const scale = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.min((el.clientWidth - pad * 2) / Math.max(1, b.x2 - b.x1), (el.clientHeight - pad * 2) / Math.max(1, b.y2 - b.y1))),
    );
    setView({
      scale,
      x: el.clientWidth / 2 - ((b.x1 + b.x2) / 2) * scale,
      y: el.clientHeight / 2 - ((b.y1 + b.y2) / 2) * scale,
    });
  }, [doc]);

  const getPt = (e: React.PointerEvent): Pt => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top }, stateRef.current.view);
  };

  const snapped = (p: Pt) => snapPt(p, doc.settings.gridSize, doc.settings.snap);
  /** Ngon tool has its own snap + grid division. */
  const snappedNgon = (p: Pt) => snapPt(p, doc.settings.gridSize / ngon.division, ngon.snap);
  const ngonShape = (center: Pt, edge: Pt): Shape => {
    const pts = regularPolygon(center, edge, ngon.sides, ngon.drawTo);
    return {
      id: "preview",
      kind: "poly",
      erase: ngon.mode === "erase",
      pts: ngon.rough ? roughenPoly(pts, Math.max(2, doc.settings.gridSize * 0.12)) : pts,
    };
  };

  const finishPoly = useCallback(() => {
    setPolyPts((pts) => {
      if (pts.length >= 3) {
        commit((d) => ({ ...d, shapes: [...d.shapes, { id: uid("s"), kind: "poly", erase: false, pts }] }));
      }
      return [];
    });
  }, [commit]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const world = getPt(e);
    const p = snapped(world);
    setCursor(world);
    const panning = e.button === 1 || tool === "pan" || spaceDown || e.altKey;
    if (panning) {
      drag.current = { mode: "pan", startX: e.clientX, startY: e.clientY, ox: view.x, oy: view.y };
      return;
    }
    if (e.button !== 0) return;

    switch (tool) {
      case "select": {
        const pickable = doc.objects.filter((o) => {
          const l = doc.layers.find((x) => x.id === o.layerId);
          return !l || (l.visible && !l.locked);
        });
        const obj = [...pickable].reverse().find((o) => objectHit(world, o));
        const shape = obj ? null : [...doc.shapes].reverse().find((s) => !s.erase && pointInShape(world, s));
        const id = obj?.id ?? shape?.id;
        if (id) {
          setSelected(e.shiftKey ? (sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]) : [id]);
          if (obj) setActiveLayer(obj.layerId);
          drag.current = { mode: "move", last: world, moved: false };
        } else {
          setSelected([]);
        }
        break;
      }

      case "rect":
      case "ellipse":
      case "eraseRect": {
        drag.current = { mode: "draw", start: p };
        setPreview({
          id: "preview",
          kind: tool === "ellipse" ? "ellipse" : "rect",
          erase: tool === "eraseRect",
          a: p,
          b: p,
        });
        break;
      }
      case "ngon": {
        const c = snappedNgon(world);
        drag.current = { mode: "draw", start: c };
        setPreview(ngonShape(c, { x: c.x + doc.settings.gridSize, y: c.y }));
        break;
      }
      case "brush":
      case "eraseBrush": {
        drag.current = { mode: "stroke" };
        setPreview({ id: "preview", kind: "path", erase: tool === "eraseBrush", pts: [world], width: brushWidth });
        break;
      }
      case "poly": {
        setPolyPts((pts) => {
          if (pts.length >= 3 && Math.hypot(p.x - pts[0]!.x, p.y - pts[0]!.y) < doc.settings.gridSize * 0.6) {
            commit((d) => ({ ...d, shapes: [...d.shapes, { id: uid("s"), kind: "poly", erase: false, pts }] }));
            return [];
          }
          return [...pts, p];
        });
        break;
      }
      case "door":
      case "stairs":
      case "pillar":
      case "text":
      case "npc":
      case "item":
      case "trigger":
      case "light": {
        const id = uid("o");
        const g = doc.settings.gridSize;
        const layerId = doc.layers.find((l) => l.id === DEFAULT_LAYER_FOR[tool])?.id ?? activeLayer;

        const base = { id, layerId };
        let obj: MapObject | null = null;
        if (tool === "door") obj = { ...base, kind: "door", x: p.x, y: p.y, angle: 0, size: g, variant: doorVariant, blocksLight: true };
        if (tool === "stairs") obj = { ...base, kind: "stairs", x: p.x, y: p.y, angle: 0, size: g * 2, steps: 6 };
        if (tool === "pillar") obj = { ...base, kind: "pillar", x: p.x, y: p.y, r: Math.max(4, g * 0.22) };
        if (tool === "npc")
          obj = { ...base, kind: "npc", x: p.x, y: p.y, r: Math.max(8, g * 0.42), color: "#c0392b", label: "", hostile: true, name: "NPC" };
        if (tool === "item")
          obj = { ...base, kind: "item", x: p.x, y: p.y, size: Math.max(10, g * 0.5), color: "#e0a92b", label: "", name: "Item" };
        if (tool === "trigger")
          obj = { ...base, kind: "trigger", x: p.x, y: p.y, w: g * 2, h: g * 2, color: "#9b59b6", trigger: "trap", label: "", name: "Trigger" };
        if (tool === "light")
          obj = { ...base, kind: "light", x: p.x, y: p.y, radius: g * 6, color: "#ffcf8a", intensity: 0.85, name: "Light" };
        if (tool === "text") {
          const text = window.prompt("Label text", "Room");
          if (!text) return;
          obj = { ...base, kind: "text", x: world.x, y: world.y, text, size: Math.max(12, g * 0.6) };
        }
        if (!obj) return;
        const created = obj;
        commit((d) => ({ ...d, objects: [...d.objects, created] }));
        setSelected([id]);
        drag.current = { mode: "place", id, origin: world };
        break;
      }

      default:
        break;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const world = getPt(e);
    setCursor(world);
    const d = drag.current;
    if (d.mode === "pan") {
      setView((v) => ({ ...v, x: d.ox + (e.clientX - d.startX), y: d.oy + (e.clientY - d.startY) }));
      return;
    }
    if (d.mode === "draw") {
      if (tool === "ngon") {
        setPreview(ngonShape(d.start, snappedNgon(world)));
        return;
      }
      const p = snapped(world);
      setPreview((prev) => (prev && prev.kind !== "path" && prev.kind !== "poly" ? { ...prev, a: d.start, b: p } : prev));
      return;
    }
    if (d.mode === "stroke") {
      setPreview((prev) => {
        if (!prev || prev.kind !== "path") return prev;
        const last = prev.pts[prev.pts.length - 1]!;
        if (Math.hypot(world.x - last.x, world.y - last.y) < 2 / view.scale) return prev;
        return { ...prev, pts: [...prev.pts, world] };
      });
      return;
    }
    if (d.mode === "move") {
      const dx = world.x - d.last.x;
      const dy = world.y - d.last.y;
      if (!dx && !dy) return;
      drag.current = { mode: "move", last: world, moved: true };
      setDocState((doc0) => ({
        ...doc0,
        shapes: doc0.shapes.map((s) => (selected.includes(s.id) ? translateShape(s, dx, dy) : s)),
        objects: doc0.objects.map((o) => (selected.includes(o.id) ? { ...o, x: o.x + dx, y: o.y + dy } : o)),
      }));
      return;
    }
    if (d.mode === "place") {
      const dx = world.x - d.origin.x;
      const dy = world.y - d.origin.y;
      if (Math.hypot(dx, dy) < 6 / view.scale) return;
      const angle = Math.atan2(dy, dx);
      setDocState((doc0) => ({
        ...doc0,
        objects: doc0.objects.map((o) => (o.id === d.id && (o.kind === "door" || o.kind === "stairs") ? { ...o, angle } : o)),
      }));

    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = { mode: "none" };
    if (d.mode === "draw" || d.mode === "stroke") {
      const prev = preview;
      setPreview(null);
      if (!prev) return;
      const ok =
        prev.kind === "path"
          ? prev.pts.length > 0
          : prev.kind === "poly"
            ? prev.pts.length > 2
            : Math.abs(prev.a.x - prev.b.x) > 1 && Math.abs(prev.a.y - prev.b.y) > 1;
      if (ok) {
        const id = uid("s");
        const rough = doc.settings.roughness;
        let shape: Shape = { ...prev, id };
        // global hand-drawn wobble turns straight-edged rooms into scrawled outlines
        if (rough > 0 && (prev.kind === "rect" || prev.kind === "poly")) {
          const pts =
            prev.kind === "rect"
              ? [
                  { x: prev.a.x, y: prev.a.y },
                  { x: prev.b.x, y: prev.a.y },
                  { x: prev.b.x, y: prev.b.y },
                  { x: prev.a.x, y: prev.b.y },
                ]
              : prev.pts;
          shape = { id, kind: "poly", erase: prev.erase, pts: roughenPoly(pts, rough) };
        }
        commit((doc0) => ({ ...doc0, shapes: [...doc0.shapes, shape] }));
      }
    }
    if (d.mode === "move" && d.moved) {
      setDocState((cur) => {
        setPast((p) => [...p.slice(-80), cur]);
        return cur;
      });
    }
  };

  const deleteSelected = useCallback(() => {
    if (!selected.length) return;
    commit((d) => ({
      ...d,
      shapes: d.shapes.filter((s) => !selected.includes(s.id)),
      objects: d.objects.filter((o) => !selected.includes(o.id)),
    }));
    setSelected([]);
  }, [commit, selected]);

  const rotateSelected = useCallback(
    (delta: number) => {
      commit((d) => ({
        ...d,
        objects: d.objects.map((o) =>
          selected.includes(o.id) && (o.kind === "door" || o.kind === "stairs") ? { ...o, angle: o.angle + delta } : o,
        ),
      }));
    },
    [commit, selected],
  );


  // keyboard
  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    const down = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.code === "Space") {
        setSpaceDown(true);
        e.preventDefault();
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (e.key === "Enter") {
        finishPoly();
        return;
      }
      if (e.key === "Escape") {
        setPolyPts([]);
        setSelected([]);
        setPreview(null);
        return;
      }
      if (e.key === "[") rotateSelected(-Math.PI / 12);
      if (e.key === "]") rotateSelected(Math.PI / 12);
      const t = TOOLS.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
      if (t) setTool(t.id);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [undo, redo, deleteSelected, finishPoly, rotateSelected]);

  const exportPng = useCallback(() => {
    const b = docBounds(doc);
    if (!b) return;
    const pad = 60;
    const scale = 2;
    const w = Math.max(64, b.x2 - b.x1 + pad * 2);
    const h = Math.max(64, b.y2 - b.y1 + pad * 2);
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(6000, w * scale);
    canvas.height = Math.min(6000, h * scale);
    const ctx = canvas.getContext("2d")!;
    renderScene(ctx, doc, { x: (-b.x1 + pad), y: (-b.y1 + pad), scale: 1 }, w, h, { hideUi: true, dpr: scale });
    const a = document.createElement("a");
    a.download = "dungeon-map.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }, [doc]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.download = "dungeon-map.json";
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, [doc]);

  const importJson = useCallback(
    (file: File) => {
      file.text().then((txt) => {
        try {
          const parsed = JSON.parse(txt) as Partial<Doc>;
          if (!parsed || !Array.isArray(parsed.shapes)) throw new Error("bad file");
          const migrated = migrateDoc(parsed);
          commit(migrated);
          setActiveLayer(migrated.layers[0]!.id);
        } catch {
          window.alert("That file isn't a valid dungeon map.");
        }
      });
    },
    [commit],
  );

  const exportSvg = useCallback(() => exportSvgFile(doc), [doc]);
  const exportPdf = useCallback(() => {
    exportPdfFile(doc).catch(() => window.alert("PDF export failed."));
  }, [doc]);

  // ---- layer management ----
  const updateLayer = useCallback(
    (id: string, patch: Partial<Layer>) => {
      commit((d) => ({ ...d, layers: d.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
    },
    [commit],
  );

  const moveLayer = useCallback(
    (id: string, dir: -1 | 1) => {
      commit((d) => {
        const i = d.layers.findIndex((l) => l.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= d.layers.length) return d;
        const layers = [...d.layers];
        [layers[i], layers[j]] = [layers[j]!, layers[i]!];
        return { ...d, layers };
      });
    },
    [commit],
  );

  /** Drag & drop reorder: place `id` directly above/below `targetId`. */
  const reorderLayer = useCallback(
    (id: string, targetId: string, place: "above" | "below") => {
      if (id === targetId) return;
      commit((d) => {
        const from = d.layers.findIndex((l) => l.id === id);
        if (from < 0) return d;
        const layers = [...d.layers];
        const [moved] = layers.splice(from, 1);
        if (!moved) return d;
        const t = layers.findIndex((l) => l.id === targetId);
        if (t < 0) return d;
        // array order is bottom -> top, so "above" means after the target
        layers.splice(place === "above" ? t + 1 : t, 0, moved);
        return { ...d, layers };
      });
    },
    [commit],
  );

  const addLayer = useCallback(() => {
    const id = uid("layer");
    commit((d) => ({
      ...d,
      layers: [...d.layers, { id, name: `Layer ${d.layers.length + 1}`, visible: true, locked: false, opacity: 1 }],
    }));
    setActiveLayer(id);
  }, [commit]);

  const deleteLayer = useCallback(
    (id: string) => {
      const count = doc.objects.filter((o) => o.layerId === id).length;
      if (doc.layers.length <= 1) return;
      if (count && !window.confirm(`Delete this layer and its ${count} object(s)?`)) return;
      commit((d) => ({
        ...d,
        layers: d.layers.filter((l) => l.id !== id),
        objects: d.objects.filter((o) => o.layerId !== id),
      }));
      setActiveLayer((cur) => (cur === id ? (doc.layers.find((l) => l.id !== id)?.id ?? cur) : cur));
    },
    [commit, doc],
  );

  const updateObject = useCallback(
    (id: string, patch: Partial<MapObject>) => {
      commit((d) => ({
        ...d,
        objects: d.objects.map((o) => (o.id === id ? ({ ...o, ...patch } as MapObject) : o)),
      }));
    },
    [commit],
  );

  const selectedObject = useMemo(
    () => doc.objects.find((o) => selected.includes(o.id)) ?? null,
    [doc.objects, selected],
  );


  const cursorStyle = useMemo(() => {
    if (spaceDown || tool === "pan") return "grab";
    if (tool === "select") return "default";
    if (tool === "text") return "text";
    return "crosshair";
  }, [spaceDown, tool]);

  const gridCoord = `${Math.round(snapVal(cursor.x, doc.settings.gridSize, true) / doc.settings.gridSize)}, ${Math.round(
    snapVal(cursor.y, doc.settings.gridSize, true) / doc.settings.gridSize,
  )}`;

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border bg-sidebar px-4 py-2.5">
        <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-arcane">Dungeon Scrawl</h1>
        <span className="text-xs text-muted-foreground">Map maker for tabletop RPGs</span>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] tabular-nums">{doc.shapes.length} shapes</Badge>
          <Badge variant="secondary" className="text-[10px] tabular-nums">{doc.objects.length} objects</Badge>
          <Badge variant="outline" className="text-[10px] tabular-nums">cell {gridCoord}</Badge>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Toolbar
          tool={tool}
          onTool={(t) => {
            setTool(t);
            setPolyPts([]);
          }}
          onUndo={undo}
          onRedo={redo}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          zoom={view.scale}
          onZoom={zoomBy}
        />
        <div
          ref={wrapRef}
          className="relative min-w-0 flex-1 touch-none select-none"
          style={{ cursor: cursorStyle }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onDoubleClick={finishPoly}
          onContextMenu={(e) => {
            e.preventDefault();
            setPolyPts([]);
          }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" />
          {!doc.shapes.length && !polyPts.length && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="rounded-xl border border-border bg-card/80 px-5 py-3 backdrop-blur text-center text-xs leading-relaxed text-muted-foreground">
                Drag with the rectangle tool to carve your first room.
                <br />
                Scroll to zoom · Space or middle-drag to pan · Ctrl+Z to undo
              </p>
            </div>
          )}
        </div>
        <aside className="panel-scroll flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-l border-border bg-sidebar p-4">
          <LayersPanel
            doc={doc}
            activeLayer={activeLayer}
            onActiveLayer={setActiveLayer}
            onUpdateLayer={updateLayer}
            onMoveLayer={moveLayer}
            onReorderLayer={reorderLayer}
            onAddLayer={addLayer}
            onDeleteLayer={deleteLayer}
            selected={selected}
            onSelect={setSelected}
          />
          <PropertiesPanel doc={doc} object={selectedObject} onChange={updateObject} onDelete={deleteSelected} />
        </aside>
        <SidePanel
          settings={doc.settings}
          onChange={setSettings}
          brushWidth={brushWidth}
          onBrushWidth={setBrushWidth}
          doorVariant={doorVariant}
          onDoorVariant={(v) => setDoorVariant(v as DoorVariant)}
          ngon={ngon}
          onNgon={(patch) => setNgon((n) => ({ ...n, ...patch }))}
          onExportPng={exportPng}
          onExportSvg={exportSvg}
          onExportPdf={exportPdf}
          onExportJson={exportJson}
          onImportJson={importJson}
          onFit={fit}
          onClear={() => {
            if (window.confirm("Clear the whole map?")) commit(emptyDoc());
          }}
        />

      </div>
    </div>
  );
}
