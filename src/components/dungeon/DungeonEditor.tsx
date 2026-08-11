import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, AlertCircle, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useHotkeys } from "react-hotkeys-hook";
import { useAutosave } from "@/hooks/use-autosave";

import { Button } from "@/components/ui/button";
import { dialog } from "@/lib/dialog";



import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { SidePanel } from "./SidePanel";
import { Toolbar, TOOLS, type ToolId } from "./Toolbar";
import { GraphicsSettingsPanel } from "./GraphicsSettingsPanel";
import { AiPanel } from "./AiPanel";
import { AssetLibraryPanel } from "./AssetLibraryPanel";
import { GeneratorPanel } from "./GeneratorPanel";
import { FogPanel, type FogMode } from "./FogPanel";
import { FloorsPanel } from "./FloorsPanel";
import { HistoryPanel, type HistoryEntry } from "./HistoryPanel";
import { CmsPanel } from "./CmsPanel";
import { MapsPanel } from "./MapsPanel";
import {
  allMapCells,
  cellKeyAt,
  cellsInRadius,
  cellsInRect,
  DEFAULT_LAYER_FOR,
  DEFAULT_NGON,
  docBounds,
  emptyDoc,
  migrateDoc,
  objectHit,
  pointInShape,
  regularPolygon,
  roughenPoly,
  addFloor,
  addFloorLink,
  deleteFloor,
  floorBelow,
  moveFloor,
  removeFloorLink,
  renameFloor,
  shapePoints,
  switchFloor,
  syncActiveFloor,
  snapPt,
  snapVal,
  translateShape,
  uid,
  type Doc,
  type DoorVariant,
  type FloorLinkKind,
  type Layer,
  type MapObject,
  type NgonOpts,
  type Pt,
  type Settings,
  type Shape,
  type View,
} from "@/lib/dungeon/model";
import type { AiSuggestion } from "@/lib/ai.functions";
import { exportPdfFile, exportSvgFile } from "@/lib/dungeon/exporters";
import { renderScene, screenToWorld } from "@/lib/dungeon/render";
import { unprojectToPlane, getCamera } from "@/lib/dungeon/camera";
import { ViewCube } from "./view-cube/ViewCube";
import { CloudBar } from "./CloudBar";
import { PropsPanel } from "./PropsPanel";
import { getImage, onImageLoaded } from "@/lib/dungeon/assets";
import { TopMenuBar } from "./TopMenuBar";
import { StatusBar } from "./StatusBar";
import { LeftRail, type PanelId } from "./LeftRail";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { recordDraw } from "@/lib/dungeon/perf";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { QuickStartPanel } from "./QuickStartPanel";
import { Minimap } from "./Minimap";
import { PropPreviewModal } from "../props/PropPreviewModal";
import { HelpCenter } from "./docs/HelpCenter";
import { HelpButton } from "./docs/HelpButton";
import { AuthDialog } from "./AuthDialog";
import { saveMapLocally } from "@/lib/dungeon/storage";
import { supabase } from "@/integrations/supabase/client";




const STORAGE_KEY = "dungeon-scrawl-doc-v1";
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 8;
const HISTORY_LIMIT = 120;

type Drag =
  | { mode: "none" }
  | { mode: "pan"; startX: number; startY: number; ox: number; oy: number }
  | { mode: "draw"; start: Pt }
  | { mode: "stroke" }
  | { mode: "fog"; hide: boolean; start: Pt }
  | { mode: "move"; last: Pt; moved: boolean }
  | { mode: "place"; id: string; origin: Pt }
  | { mode: "camera_orbit"; startX: number; startY: number; yaw: number; pitch: number }
  | { mode: "camera_pan"; startX: number; startY: number; ox: number; oy: number }
  | { mode: "camera_zoom"; startY: number; startDistance: number };


export function DungeonEditor() {


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [doc, setDocState] = useState<Doc>(() => {
    const d = emptyDoc();
    // Scrub prompt text if it somehow persisted to a new empty doc
    d.objects = d.objects.filter(o => o.kind !== 'text' || (!o.text.includes('Do not make') && !o.text.includes('/skill:') && !o.text.includes('fix createCsrf')));
    
    return d;
  });
  /** Full labelled timeline; index points at the state currently rendered. */
  const [timeline, setTimeline] = useState<{ doc: Doc; label: string; at: number }[]>(() => [
    { doc: emptyDoc(), label: "Initial state", at: Date.now() },
  ]);
  const [hIndex, setHIndex] = useState(0);
  const hIndexRef = useRef(0);
  hIndexRef.current = hIndex;
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  // Feature flags for unstable systems (Phase 5)
  const [flags] = useState({
    ENABLE_CAMERA: false,
    ENABLE_VIEW_CUBE: false,
    ENABLE_3D_DRAG: false,
  });
  const [tool, setTool] = useState<ToolId>("rect");
  const [preview, setPreview] = useState<Shape | null>(null);
  /** AI suggestion staged as a ghost overlay, awaiting accept/reject. */
  const [aiPreview, setAiPreview] = useState<AiSuggestion | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [show3dPreview, setShow3dPreview] = useState(false);
  const [polyPts, setPolyPts] = useState<Pt[]>([]);
  const [brushWidth, setBrushWidth] = useState(48);
  const [doorVariant, setDoorVariant] = useState<DoorVariant>("door");
  const [ngon, setNgon] = useState<NgonOpts>(DEFAULT_NGON);
  const [cursor, setCursor] = useState<Pt>({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string>(() => emptyDoc().layers[0]!.id);
  const [fogMode, setFogMode] = useState<FogMode>("brush");
  const [fogBrush, setFogBrush] = useState(96);
  const [leftPanel, setLeftPanel] = useState<PanelId | null>("settings");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveMs, setSaveMs] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [engineReady, setEngineReady] = useState(true); // Default to true to prevent black screen if JS fails to hydrate correctly
  const [docBytes, setDocBytes] = useState(0);

  const [menuTarget, setMenuTarget] = useState<{
    pt: Pt;
    label: string | null;
    id: string | null;
    processingIds: string[];
  }>({
    pt: { x: 0, y: 0 },
    label: null,
    id: null,
    processingIds: [],
  });
  const clipboard = useRef<{ shapes: Shape[]; objects: MapObject[] } | null>(null);
  const [clipCount, setClipCount] = useState(0);
  const online = useOnlineStatus();
  const importRef = useRef<HTMLInputElement>(null);
  const [previewProp, setPreviewProp] = useState<{ id: string; url: string; name: string; license?: string | null } | null>(null);
  const [minimapPos, setMinimapPos] = useState(() => {
    try {
      const saved = localStorage.getItem("minimap-pos");
      return saved ? JSON.parse(saved) : { x: 16, y: 16 };
    } catch {
      return { x: 16, y: 16 };
    }
  });

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<string | null>(null);

  const { hasDraft, recoverDraft, discardDraft } = useAutosave(doc, (draft) => {
    setDocState(draft);
    setTimeline([{ doc: draft, label: "Recovered draft", at: Date.now() }]);
    hIndexRef.current = 0;
    setHIndex(0);
  });

  const openHelp = useCallback((sectionId?: string) => {
    setHelpSection(sectionId || "quick-start");
    setHelpOpen(true);
  }, []);

  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => setIsLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => setIsLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const requireAuth = useCallback((reason: string, action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setAuthReason(reason);
      setAuthOpen(true);
      toast.info("Authentication Required", {
        description: reason,
        action: {
          label: "Login",
          onClick: () => setAuthOpen(true)
        }
      });
    }
  }, [isLoggedIn]);

  // Hotkeys
  useHotkeys('ctrl+z, cmd+z', (e) => { e.preventDefault(); undo(); });
  useHotkeys('ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z', (e) => { e.preventDefault(); redo(); });
  useHotkeys('backspace, delete', () => {
    if (selected.length) {
      commit((d) => ({ ...d, objects: d.objects.filter(o => !selected.includes(o.id)) }), "Delete objects");
      setSelected([]);
    }
  });
  useHotkeys('r', () => setTool('rect'));
  useHotkeys('b', () => setTool('brush'));
  useHotkeys('p', () => setTool('poly'));
  useHotkeys('e', () => setTool('eraseBrush'));
  useHotkeys('d', () => setTool('door'));
  useHotkeys('s', () => setTool('stairs'));
  useHotkeys('l', () => setTool('light'));
  useHotkeys('t', () => setTool('text'));
  useHotkeys('v', () => setTool('select'));
  useHotkeys('l', () => setLeftPanel('floors')); // Changed from Layers to Floors as a sensible default
  useHotkeys('k', () => setLeftPanel('asset-library'));
  useHotkeys('space', (e) => {
    if (!e.repeat) setSpaceDown(true);
  }, { keydown: true });
  useHotkeys('space', () => setSpaceDown(false), { keyup: true });
  // Debounce rapid history pushes with the same label into a single snapshot.
  const pendingHistory = useRef<{ value: Doc; label: string } | null>(null);
  const historyTimer = useRef<number | null>(null);
  const HISTORY_DEBOUNCE_MS = 800; // Increased to 800ms for better batching of rapid edits



  const drag = useRef<Drag>({ mode: "none" });
  const stateRef = useRef({ doc, view, tool, polyPts, brushWidth, doorVariant, selected, spaceDown });
  stateRef.current = { doc, view, tool, polyPts, brushWidth, doorVariant, selected, spaceDown };

  /** Flush the debounced history snapshot immediately. */
  const flushHistory = useCallback(() => {
    if (historyTimer.current) {
      window.clearTimeout(historyTimer.current);
      historyTimer.current = null;
    }
    const p = pendingHistory.current;
    pendingHistory.current = null;
    if (!p) return;
    setTimeline((h) => {
      const out = [...h.slice(0, hIndexRef.current + 1), { doc: p.value, label: p.label, at: Date.now() }].slice(-HISTORY_LIMIT);
      hIndexRef.current = out.length - 1;
      setHIndex(hIndexRef.current);
      return out;
    });
  }, []);

  /** Push a labelled snapshot onto the timeline, discarding any redo branch. */
  const pushHistory = useCallback((value: Doc, label: string) => {
    pendingHistory.current = { value, label };
    if (historyTimer.current) window.clearTimeout(historyTimer.current);
    historyTimer.current = window.setTimeout(() => {
      historyTimer.current = null;
      flushHistory();
    }, HISTORY_DEBOUNCE_MS);
  }, [flushHistory]);


  const commit = useCallback(
    (next: Doc | ((d: Doc) => Doc), label = "Edit") => {
      setDocState((prev) => {
        const value = typeof next === "function" ? (next as (d: Doc) => Doc)(prev) : next;
        if (value === prev) return prev;
        pushHistory(value, label);
        return value;
      });
    },
    [pushHistory],
  );

  /** Stash the current floor's content and load another floor. */
  const selectFloor = useCallback(
    (id: string) => {
      setSelected([]);
      setPreview(null);
      setPolyPts([]);
      setAiPreview(null);
      commit((d) => switchFloor(d, id), "Switch floor");
    },
    [commit],
  );


  const setSettings = useCallback((patch: Partial<Settings>) => {
    setDocState((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const jumpTo = useCallback((index: number) => {
    flushHistory();
    setTimeline((h) => {
      const i = Math.max(0, Math.min(h.length - 1, index));
      const entry = h[i];
      if (entry) {
        hIndexRef.current = i;
        setHIndex(i);
        setDocState(entry.doc);
      }
      return h;
    });
  }, [flushHistory]);


  const undo = useCallback(() => jumpTo(hIndexRef.current - 1), [jumpTo]);
  const redo = useCallback(() => jumpTo(hIndexRef.current + 1), [jumpTo]);

  const historyEntries: HistoryEntry[] = useMemo(
    () => timeline.map((e) => ({ label: e.label, at: e.at })),
    [timeline],
  );

  // load / autosave
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Doc>;
        if (parsed && Array.isArray(parsed.shapes)) {
          const migrated = migrateDoc(parsed);
          // Scrub prompt contamination on load
          migrated.objects = migrated.objects.filter(o => 
            o.kind !== 'text' || 
            (!o.text.includes('Do not make any visual modifications') && 
             !o.text.includes('/skill:') &&
             !o.text.includes('fix createCsrfMiddleware'))
          );
          setDocState(migrated);
          setTimeline([{ doc: migrated, label: "Restored map", at: Date.now() }]);
          hIndexRef.current = 0;
          setHIndex(0);
          setActiveLayer(migrated.layers[0]!.id);
        }
      }
    } catch {

      /* ignore */
    }
  }, []);


  useEffect(() => {
    setSaveStatus("saving");
    const t = setTimeout(() => {
      try {
        const t0 = performance.now();
        const payload = JSON.stringify(doc);
        localStorage.setItem(STORAGE_KEY, payload);
        setDocBytes(payload.length);
        setSaveMs(performance.now() - t0);
        setSavedAt(Date.now());
        setSaveStatus("saved");
        // Also save to "Local DB" simulated in localStorage
        saveMapLocally(doc, "Last Session").catch(console.error);
      } catch {

        setSaveStatus("error");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [doc]);

  // Engine readiness spinner: dismissed after first paint or on timeout.
  useEffect(() => {
    // Safety fallback to clear loader - decreased timeout to 300ms for faster recovery
    const t = setTimeout(() => {
      setEngineReady(true);
      console.log("Engine initialization complete (safety fallback)");
    }, 300);
    return () => clearTimeout(t);
  }, []);






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
    const t0 = performance.now();
    renderScene(ctx, doc, view, w, h, { preview: livePreview, selectedIds: selected, processingIds: menuTarget.processingIds, dpr });
    recordDraw(performance.now() - t0);

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

    // Faint ghost of the floor directly below (RE4-style floor stacking).
    const below = doc.showUnderlay && !doc.settings.playerView ? floorBelow(doc) : undefined;
    if (below && below.shapes.length) {
      ctx.save();
      ctx.setTransform(view.scale * dpr, 0, 0, view.scale * dpr, view.x * dpr, view.y * dpr);
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = doc.settings.inkColor;
      ctx.lineWidth = 1.5 / view.scale;
      ctx.setLineDash([6 / view.scale, 5 / view.scale]);
      for (const sh of below.shapes) {
        if (sh.erase) continue;
        const pts = shapePoints(sh);
        ctx.beginPath();
        if (sh.kind === "rect") {
          ctx.rect(Math.min(pts[0]!.x, pts[1]!.x), Math.min(pts[0]!.y, pts[1]!.y), Math.abs(pts[1]!.x - pts[0]!.x), Math.abs(pts[1]!.y - pts[0]!.y));
        } else if (sh.kind === "ellipse") {
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
          pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          if (sh.kind === "poly") ctx.closePath();
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Ghost overlay for a staged AI suggestion (not yet part of the document).
    if (aiPreview) {
      const g = doc.settings.gridSize;
      ctx.save();
      ctx.setTransform(view.scale * dpr, 0, 0, view.scale * dpr, view.x * dpr, view.y * dpr);
      ctx.lineWidth = 2 / view.scale;
      ctx.setLineDash([8 / view.scale, 6 / view.scale]);
      ctx.strokeStyle = "#f5c451";
      ctx.fillStyle = "rgba(167,139,250,0.16)";
      for (const r of aiPreview.rooms) {
        const w = Math.max(1, r.w) * g;
        const h = Math.max(1, r.h) * g;
        ctx.fillRect(r.x * g, r.y * g, w, h);
        ctx.strokeRect(r.x * g, r.y * g, w, h);
        if (r.name) {
          ctx.save();
          ctx.setLineDash([]);
          ctx.fillStyle = "#f5c451";
          ctx.font = `${Math.max(10, g * 0.42)}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(r.name, r.x * g + w / 2, r.y * g + h / 2);
          ctx.restore();
        }
      }
      ctx.strokeStyle = "rgba(167,139,250,0.9)";
      ctx.lineWidth = Math.max(3, g * 0.5) / 1;
      for (const c of aiPreview.corridors) {
        ctx.beginPath();
        ctx.moveTo(c.x1 * g, c.y1 * g);
        ctx.lineTo(c.x2 * g, c.y2 * g);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineWidth = 2 / view.scale;
      for (const o of aiPreview.objects) {
        ctx.beginPath();
        ctx.arc(o.x * g, o.y * g, Math.max(4, g * 0.22), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,196,81,0.35)";
        ctx.fill();
        ctx.strokeStyle = "#f5c451";
        ctx.stroke();
      }
      if (aiPreview.stamps) {
        for (const st of aiPreview.stamps) {
          const img = getImage(st.url);
          const w = (st.w ? st.w : 2) * g;
          const h = (st.h ? st.h : 2) * g;
          ctx.save();
          ctx.translate(st.x * g, st.y * g);
          ctx.globalAlpha = 0.5;
          if (img) {
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
          } else {
            ctx.strokeStyle = "#f5c451";
            ctx.strokeRect(-w / 2, -h / 2, w, h);
          }
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }, [doc, view, preview, selected, polyPts, cursor, aiPreview]);


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
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);

      if (stateRef.current.doc.settings.cameraMode) {
        const s = stateRef.current.doc.settings;
        const delta = dy > 0 ? 1.1 : 0.9;
        setSettings({
          cameraDistance: Math.max(100, Math.min(s.maxDrawDistance, s.cameraDistance * delta))
        });
        return;
      }

      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setView((v) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * Math.exp(-dy * 0.0015)));
        const k = next / v.scale;
        return { scale: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Force engine ready if we see the canvas has size
  useEffect(() => {
    if (!engineReady && canvasRef.current && canvasRef.current.width > 0) {
      setEngineReady(true);
    }
  }, [engineReady]);

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
    const el = wrapRef.current!;
    const rect = el.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Main editor returns to stable 2D (or original) interaction model
    // 3D camera unprojection is revoked from the primary workspace to ensure stability.
    return screenToWorld({ x: screenX, y: screenY }, stateRef.current.view);
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

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      // Offset by left rail width (approx 52px)
      const newWidth = Math.max(200, Math.min(800, e.clientX - 52));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  const onPointerDown = async (e: React.PointerEvent) => {
    // If a modal is open, block all canvas interaction
    if (previewProp) return;

    (e.target as Element).setPointerCapture?.(e.pointerId);
    const world = getPt(e);
    const p = snapped(world);
    setCursor(world);
    const panning = e.button === 1 || e.button === 2 || tool === "pan" || spaceDown || e.altKey;
    if (panning) {
      if (doc.settings.cameraMode) {
        if (e.button === 1 || (e.button === 2 && (e.ctrlKey || e.metaKey || e.shiftKey))) {
           drag.current = { mode: "camera_pan", startX: e.clientX, startY: e.clientY, ox: doc.settings.cameraTarget.x, oy: doc.settings.cameraTarget.y };
        } else if (e.button === 2) {
           // Right click for context menu handled by ContextMenuTrigger, 
           // but we might want middle-drag or shift-drag specifically for 3D pan.
           // Let's stick to standard: Left=Orbit, Middle/Right=Pan (if configured)
           drag.current = { mode: "camera_pan", startX: e.clientX, startY: e.clientY, ox: doc.settings.cameraTarget.x, oy: doc.settings.cameraTarget.y };
        }
      } else {
        drag.current = { mode: "pan", startX: e.clientX, startY: e.clientY, ox: view.x, oy: view.y };
      }
      return;
    }
    if (doc.settings.cameraMode) {
      if (spaceDown || e.button === 1) {
        drag.current = { mode: "pan", startX: e.clientX, startY: e.clientY, ox: view.x, oy: view.y };
        return;
      }
    }
    if (e.button !== 0) return;

    switch (tool) {
      case "select": {
        const pickable = doc.objects.filter((o) => {
          const l = doc.layers.find((x) => x.id === o.layerId);
          return !l || (l.visible && !l.locked);
        });
        const globalObjScale = doc.settings.objectRenderScale || 1;
        const obj = [...pickable].reverse().find((o) => {
          const isSelected = selected.includes(o.id);
          const hasAnySelected = selected.length > 0;
          let extraScale = 1;
          if (hasAnySelected) {
            if (isSelected) extraScale = globalObjScale;
          } else {
            extraScale = globalObjScale;
          }
          return objectHit(world, o, extraScale);
        });
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
          const text = await dialog.prompt("Label text", "Room");
          if (!text) return;
          obj = { ...base, kind: "text", x: world.x, y: world.y, text, size: Math.max(12, g * 0.6) };
        }
        if (!obj) return;
        const created = obj;
        commit((d) => ({ ...d, objects: [...d.objects, created] }), `Add ${created.kind}`);
        setSelected([id]);
        drag.current = { mode: "place", id, origin: world };
        break;
      }

      case "fogHide":
      case "fogReveal": {
        const hide = tool === "fogHide";
        drag.current = { mode: "fog", hide, start: world };
        if (fogMode === "brush") paintFog(world, hide);
        break;
      }

      default:
        break;
    }
  };

  /** Live fog painting (no history push until the stroke ends). */
  const paintFog = (world: Pt, hide: boolean) => {
    setDocState((d) => {
      const keys = fogBrush <= d.settings.gridSize * 0.6 ? [cellKeyAt(world, d.settings)] : cellsInRadius(world, fogBrush / 2, d.settings);
      const set = new Set(d.fog);
      let changed = false;
      for (const k of keys) {
        if (hide ? !set.has(k) : set.has(k)) {
          changed = true;
          if (hide) set.add(k);
          else set.delete(k);
        }
      }
      return changed ? { ...d, fog: [...set] } : d;
    });
  };

  /** Cursor readout is coalesced to one state update per animation frame. */
  const cursorPending = useRef<Pt | null>(null);
  const cursorRaf = useRef(0);
  const queueCursor = useCallback((p: Pt) => {
    cursorPending.current = p;
    if (cursorRaf.current) return;
    cursorRaf.current = requestAnimationFrame(() => {
      cursorRaf.current = 0;
      if (cursorPending.current) setCursor(cursorPending.current);
    });
  }, []);
  useEffect(() => () => {
    cancelAnimationFrame(cursorRaf.current);
    flushHistory();
  }, [flushHistory]);


  const onPointerMove = (e: React.PointerEvent) => {
    // If a modal is open, block all canvas interaction
    if (previewProp) return;

    const world = getPt(e);
    queueCursor(world);
    const d = drag.current;
    if (d.mode === "pan") {
      setView((v) => ({ ...v, x: d.ox + (e.clientX - d.startX), y: d.oy + (e.clientY - d.startY) }));
      return;
    }
    if (d.mode === "camera_orbit" || d.mode === "camera_pan") {
      // 3D interaction revoked from main viewport
      return;
    }
    if (d.mode === "fog") {
      if (fogMode === "brush") paintFog(world, d.hide);
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

  const onPointerUp = (e?: React.PointerEvent) => {
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
        commit((doc0) => ({ ...doc0, shapes: [...doc0.shapes, shape] }), shape.erase ? "Erase area" : "Draw shape");
      }
    }
    if (d.mode === "fog") {
      const end = e ? getPt(e) : d.start;
      setDocState((cur) => {
        let next = cur;
        if (fogMode === "select") {
          const keys = cellsInRect(d.start, end, cur.settings);
          const set = new Set(cur.fog);
          keys.forEach((k) => (d.hide ? set.add(k) : set.delete(k)));
          next = { ...cur, fog: [...set] };
        }
        pushHistory(next, d.hide ? "Hide fog cells" : "Reveal fog cells");
        return next;
      });
    }

    if (d.mode === "move" && d.moved) {
      setDocState((cur) => {
        pushHistory(cur, "Move selection");
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
    }), "Delete selection");
    setSelected([]);
  }, [commit, selected]);

  const rotateSelected = useCallback(
    (delta: number) => {
      commit((d) => ({
        ...d,
        objects: d.objects.map((o) =>
          selected.includes(o.id) ? { ...o, rz: (o.rz ?? (o as any).angle ?? 0) + delta } : o,
        ),
      }));
    },
    [commit, selected],
  );


  /** Filled in below once the clipboard actions exist (avoids TDZ in the key handler). */
  const kbRef = useRef({
    copy: () => {},
    cut: () => {},
    paste: () => {},
    dup: () => {},
    selectAll: () => {},
    deselectAll: () => {},
  });

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
      if (mod && ["c", "x", "v", "d", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        const k = e.key.toLowerCase();
        if (k === "c") kbRef.current.copy();
        if (k === "x") kbRef.current.cut();
        if (k === "v") kbRef.current.paste();
        if (k === "d") {
          if (e.ctrlKey && e.metaKey) {
             // Just in case both are used, but we want Ctrl+D specifically
          }
          kbRef.current.deselectAll();
        }
        if (k === "a") kbRef.current.selectAll();
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

  // Re-draw once uploaded prop images finish downloading.
  const [, setImgTick] = useState(0);
  useEffect(() => {
    const off = onImageLoaded(() => setImgTick((t) => t + 1));
    return () => {
      off();
    };
  }, []);

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

  /** Small PNG data URL used as the cloud map thumbnail. */
  const thumbnail = useCallback((): string | null => {
    const b = docBounds(doc);
    if (!b) return null;
    const pad = 40;
    const w = Math.max(64, b.x2 - b.x1 + pad * 2);
    const h = Math.max(64, b.y2 - b.y1 + pad * 2);
    const scale = Math.min(1, 420 / w);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(32, Math.round(w * scale));
    canvas.height = Math.max(32, Math.round(h * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    renderScene(ctx, doc, { x: -b.x1 + pad, y: -b.y1 + pad, scale: 1 }, w, h, { hideUi: true, dpr: scale });
    try {
      return canvas.toDataURL("image/jpeg", 0.6);
    } catch {
      return null;
    }
  }, [doc]);

  /** Drop an uploaded prop image at the centre of the viewport. */
  const placeImage = useCallback(
    (url: string, name: string) => {
      const wrap = wrapRef.current;
      const cw = wrap?.clientWidth ?? 800;
      const ch = wrap?.clientHeight ?? 600;
      const center = screenToWorld({ x: cw / 2, y: ch / 2 }, view);
      const img = getImage(url);
      const base = doc.settings.gridSize * 2;
      const ratio = img && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
      const layerId = doc.layers.find((l) => l.id === DEFAULT_LAYER_FOR.image)?.id ?? doc.layers[0]!.id;
      const obj: MapObject = {
        id: uid("img"),
        layerId,
        name,
        kind: "image",
        x: center.x,
        y: center.y,
        w: ratio >= 1 ? base * ratio : base,
        h: ratio >= 1 ? base : base / ratio,
        angle: 0,
        url,
      };
      commit((d) => ({ ...d, objects: [...d.objects, obj] }), "Place prop");
      setSelected([obj.id]);
    },
    [commit, doc.layers, doc.settings.gridSize, view],
  );

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
          commit(migrated, "Import map");
          setActiveLayer(migrated.layers[0]!.id);
        } catch {
          dialog.alert("Invalid Map", "That file isn't a valid dungeon map.", "danger");
        }
      });
    },
    [commit],
  );

  const exportSvg = useCallback(() => exportSvgFile(doc), [doc]);
  const exportPdf = useCallback(() => {
    exportPdfFile(doc).catch(() => dialog.alert("Export Error", "PDF export failed.", "danger"));
  }, [doc]);

  // ---- fog of war helpers ----
  const hideAllFog = useCallback(() => {
    commit((d) => ({ ...d, fog: allMapCells(d) }), "Hide all fog");
  }, [commit]);
  const clearFog = useCallback(() => commit((d) => (d.fog.length ? { ...d, fog: [] } : d), "Clear fog"), [commit]);

  /** Turn an AI suggestion into shapes, notes and style settings. */
  const applyAi = useCallback(
    (s: AiSuggestion) => {
      commit((d) => {
        const g = d.settings.gridSize;
        const shapes: Shape[] = [...d.shapes];
        const objects: MapObject[] = [...d.objects];
        const noteLayer = d.layers.find((l) => l.id === DEFAULT_LAYER_FOR.text)?.id ?? d.layers[0]!.id;
        const doorLayer = d.layers.find((l) => l.id === DEFAULT_LAYER_FOR.door)?.id ?? d.layers[0]!.id;
        const propLayer = d.layers.find((l) => l.id === DEFAULT_LAYER_FOR.npc)?.id ?? d.layers[0]!.id;
        const imgLayer = d.layers.find((l) => l.id === DEFAULT_LAYER_FOR.image)?.id ?? d.layers[0]!.id;

        for (const r of s.rooms) {
          const a = { x: r.x * g, y: r.y * g };
          const b = { x: (r.x + Math.max(1, r.w)) * g, y: (r.y + Math.max(1, r.h)) * g };
          shapes.push({ id: uid("s"), kind: "rect", erase: false, a, b });
          if (r.name) {
            objects.push({
              id: uid("o"),
              layerId: noteLayer,
              kind: "text",
              x: (a.x + b.x) / 2,
              y: (a.y + b.y) / 2,
              text: r.name,
              size: Math.max(12, g * 0.5),
            });
          }
        }
        for (const c of s.corridors) {
          shapes.push({
            id: uid("s"),
            kind: "path",
            erase: false,
            pts: [
              { x: c.x1 * g, y: c.y1 * g },
              { x: c.x2 * g, y: c.y2 * g },
            ],
            width: Math.max(16, g * 0.9),
          });
        }

        // Add doors, NPCs, etc.
        if (s.objects && Array.isArray(s.objects)) {
          for (const o of s.objects) {
            if (o.kind === "door") {
              objects.push({
                id: uid("d"),
                kind: "door",
                x: o.x * g,
                y: o.y * g,
                angle: 0,
                size: g,
                variant: "door",
                layerId: doorLayer,
              });
            } else if (o.kind === "text") {
              objects.push({
                id: uid("t"),
                kind: "text",
                x: o.x * g,
                y: o.y * g,
                layerId: noteLayer,
                text: o.text || o.name || "Text",
                size: 12,
              });
            } else {
              objects.push({
                id: uid("o"),
                kind: "npc",
                x: o.x * g,
                y: o.y * g,
                layerId: propLayer,
                name: o.name || o.kind,
                r: g / 3,
                color: "#ff0000",
                label: (o.name || o.kind).slice(0, 1),
                hostile: false,
              });
            }
          }
        }

        const allowed: (keyof Settings)[] = [
          "hatch",
          "hatchDensity",
          "roughness",
          "wallThickness",
          "gridStyle",
          "bgColor",
          "floorColor",
          "wallColor",
          "gridColor",
          "inkColor",
        ];
        const settings = { ...d.settings };
        for (const [k, v] of Object.entries(s.settings)) {
          if (allowed.includes(k as keyof Settings)) (settings as Record<string, unknown>)[k] = v;
        }
        if (s.stamps && Array.isArray(s.stamps)) {
          for (const st of s.stamps) {
            objects.push({
              id: uid("img"),
              layerId: imgLayer,
              kind: "image",
              x: st.x * g,
              y: st.y * g,
              w: st.w ? st.w * g : g * 2,
              h: st.h ? st.h * g : g * 2,
              angle: 0,
              url: st.url,
              name: st.name || "Stamp",
            });
          }
        }
        return { ...d, shapes, objects, settings };
      }, "AI suggestion");
    },
    [commit],
  );


  // ---- layer management ----
  const updateLayer = useCallback(
    (id: string, patch: Partial<Layer>) => {
      commit((d) => ({ ...d, layers: d.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }), "Layer settings");
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
    async (id: string) => {
      const count = doc.objects.filter((o) => o.layerId === id).length;
      if (doc.layers.length <= 1) return;
      if (count && !(await dialog.confirm({
        title: "Delete Layer",
        message: `Delete this layer and its ${count} object(s)?`,
        confirmText: "Delete",
        variant: "danger"
      }))) return;
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

  const updateSelectedObjects = useCallback(
    (patch: Partial<MapObject>) => {
      if (!selected.length) return;
      commit((d) => ({
        ...d,
        objects: d.objects.map((o) => (selected.includes(o.id) ? ({ ...o, ...patch } as MapObject) : o)),
      }), "Update selected");
    },
    [commit, selected],
  );

  const deleteObject = useCallback((id: string) => {
    commit((d) => ({
      ...d,
      objects: d.objects.filter((o) => o.id !== id),
    }), "Delete object");
    setSelected((prev) => prev.filter(sid => sid !== id));
  }, [commit]);

  const selectedObject = useMemo(
    () => doc.objects.find((o) => selected.includes(o.id)) ?? null,
    [doc.objects, selected],
  );



  // ---- right-click context menu ----
  const pickAt = useCallback(
    (world: Pt) => {
      const pickable = doc.objects.filter((o) => {
        const l = doc.layers.find((x) => x.id === o.layerId);
        const isLocked = o.locked || l?.locked;
        const isVisible = o.visible !== false && l?.visible !== false;
        return isVisible && !isLocked;
      });
      const obj = [...pickable].reverse().find((o) => objectHit(world, o));
      if (obj) return { id: obj.id, label: ("name" in obj && obj.name) || obj.kind };
      const shape = [...doc.shapes].reverse().find((sh) => !sh.erase && pointInShape(world, sh));
      return shape ? { id: shape.id, label: shape.kind } : null;
    },
    [doc.layers, doc.objects, doc.shapes],
  );

  const openMenu = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const world = getPt(e as any);
    const hit = pickAt(world);
    setPolyPts([]);
    if (hit && !selected.includes(hit.id)) setSelected([hit.id]);
    if (!hit && !e.shiftKey) setSelected((sel) => (sel.length ? sel : []));
    setMenuTarget(prev => ({ ...prev, pt: world, label: hit?.label ?? null, id: hit?.id ?? null }));
  };

  const copySelection = useCallback(() => {
    if (!selected.length) return;
    clipboard.current = {
      shapes: doc.shapes.filter((sh) => selected.includes(sh.id)),
      objects: doc.objects.filter((o) => selected.includes(o.id)),
    };
    setClipCount(clipboard.current.shapes.length + clipboard.current.objects.length);
  }, [doc.objects, doc.shapes, selected]);

  /** Paste the clipboard, offset so its centre lands on `at`. */
  const pasteAt = useCallback(
    (at: Pt) => {
      const clip = clipboard.current;
      if (!clip || (!clip.shapes.length && !clip.objects.length)) return;
      const src = clip.objects[0] ?? null;
      const originX = src ? src.x : (clip.shapes[0] && "a" in clip.shapes[0] ? clip.shapes[0].a.x : at.x);
      const originY = src ? src.y : (clip.shapes[0] && "a" in clip.shapes[0] ? clip.shapes[0].a.y : at.y);
      const dx = at.x - originX;
      const dy = at.y - originY;
      const ids: string[] = [];
      commit((d) => {
        const shapes = [...d.shapes];
        const objects = [...d.objects];
        for (const sh of clip.shapes) {
          const id = uid("s");
          ids.push(id);
          shapes.push({ ...translateShape(sh, dx, dy), id });
        }
        for (const o of clip.objects) {
          const id = uid("o");
          ids.push(id);
          objects.push({ ...o, id, x: o.x + dx, y: o.y + dy });
        }
        return { ...d, shapes, objects };
      }, "Paste");
      setSelected(ids);
    },
    [commit],
  );

  const duplicateSelection = useCallback(() => {
    copySelection();
    const g = doc.settings.gridSize;
    setTimeout(() => {
      const first = doc.objects.find((o) => selected.includes(o.id));
      pasteAt({ x: (first?.x ?? menuTarget.pt.x) + g, y: (first?.y ?? menuTarget.pt.y) + g });
    }, 0);
  }, [copySelection, doc.objects, doc.settings.gridSize, menuTarget.pt, pasteAt, selected]);

  const reorderSelection = useCallback(
    (toFront: boolean) => {
      if (!selected.length) return;
      commit((d) => {
        // Group by layer first, as reordering across layers breaks the mental model
        // However, the user specifically mentioned "when click bring top down this equation would be change"
        // so we reorder within the global list while keeping layer consistency if possible.
        const move = <T extends { id: string }>(arr: T[]) => {
          const picked = arr.filter((x) => selected.includes(x.id));
          if (!picked.length) return arr;
          const rest = arr.filter((x) => !selected.includes(x.id));
          return toFront ? [...rest, ...picked] : [...picked, ...rest];
        };
        return { ...d, shapes: move(d.shapes), objects: move(d.objects) };
      }, toFront ? "Bring to front" : "Send to back");
    },
    [commit, selected],
  );

  const addObjectAt = useCallback(
    async (kind: "npc" | "item" | "trigger" | "light" | "text", at: Pt) => {
      const g = doc.settings.gridSize;
      const p = snapPt(at, g, doc.settings.snap);
      const layerId = doc.layers.find((l) => l.id === DEFAULT_LAYER_FOR[kind])?.id ?? activeLayer;
      const id = uid("o");
      const base = { id, layerId };
      let obj: MapObject | null = null;
      if (kind === "npc") obj = { ...base, kind: "npc", x: p.x, y: p.y, r: Math.max(8, g * 0.42), color: "#c0392b", label: "", hostile: true, name: "NPC" };
      if (kind === "item") obj = { ...base, kind: "item", x: p.x, y: p.y, size: Math.max(10, g * 0.5), color: "#e0a92b", label: "", name: "Item" };
      if (kind === "trigger") obj = { ...base, kind: "trigger", x: p.x, y: p.y, w: g * 2, h: g * 2, color: "#9b59b6", trigger: "trap", label: "", name: "Trigger" };
      if (kind === "light") obj = { ...base, kind: "light", x: p.x, y: p.y, radius: g * 6, color: "#ffcf8a", intensity: 0.85, name: "Light" };
      if (kind === "text") {
        const text = await dialog.prompt("Label text", "Room");
        if (!text) return;
        obj = { ...base, kind: "text", x: at.x, y: at.y, text, size: Math.max(12, g * 0.6) };
      }
      if (!obj) return;
      const created = obj;
      commit((d) => ({ ...d, objects: [...d.objects, created] }), `Add ${created.kind}`);
      setSelected([id]);
    },
    [activeLayer, commit, doc.layers, doc.settings.gridSize, doc.settings.snap],
  );

  const fogAt = useCallback(
    (at: Pt, hide: boolean) => {
      commit((d) => {
        const keys = cellsInRadius(at, Math.max(d.settings.gridSize, fogBrush) / 2, d.settings);
        const set = new Set(d.fog);
        keys.forEach((k) => (hide ? set.add(k) : set.delete(k)));
        return { ...d, fog: [...set] };
      }, hide ? "Hide fog cells" : "Reveal fog cells");
    },
    [commit, fogBrush],
  );

  const zoomTo = useCallback(
    (at: Pt) => {
      const el = wrapRef.current;
      if (!el) return;
      setView((v) => {
        const scale = Math.min(MAX_ZOOM, v.scale * 1.6);
        return { scale, x: el.clientWidth / 2 - at.x * scale, y: el.clientHeight / 2 - at.y * scale };
      });
    },
    [],
  );

  kbRef.current = {
    copy: copySelection,
    cut: () => {
      copySelection();
      deleteSelected();
    },
    paste: () => pasteAt(menuTarget.pt),
    dup: duplicateSelection,
    selectAll: () => {
      const allIds = [
        ...doc.shapes.map((s) => s.id),
        ...doc.objects.map((o) => o.id),
      ];
      setSelected(allIds);
    },
    deselectAll: () => {
      setSelected([]);
    },
  };

  const cursorStyle = useMemo(() => {
    if (spaceDown || tool === "pan") return "grab";
    if (tool === "select") return "default";
    if (tool === "text") return "text";
    return "crosshair";
  }, [spaceDown, tool]);

  const gridCoord = `${Math.round(snapVal(cursor.x, doc.settings.gridSize, true) / doc.settings.gridSize)}, ${Math.round(
    snapVal(cursor.y, doc.settings.gridSize, true) / doc.settings.gridSize,
  )}`;

  const toolLabel = TOOLS.find((t) => t.id === tool)?.label ?? tool;
  const savedLabel = savedAt ? `saved ${new Date(savedAt).toLocaleTimeString()}` : "not saved yet";

  const leftContent = (() => {
    switch (leftPanel) {
      case "settings":
        return (
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
            onClear={async () => {
              if (await dialog.confirm({
                title: "Clear Map",
                message: "Clear the whole map? This cannot be undone.",
                confirmText: "Clear All",
                variant: "danger"
              })) commit(emptyDoc(), "Clear map");
            }}
          />
        );
      case "floors":
        return (
          <FloorsPanel
            doc={syncActiveFloor(doc)}
            onSelectFloor={selectFloor}
            onAddFloor={(dup) => commit((d) => addFloor(d, undefined, dup), dup ? "Duplicate floor" : "Add floor")}
            onRenameFloor={(id, name) => commit((d) => renameFloor(d, id, name), "Rename floor")}
            onDeleteFloor={async (id) => {
              if (await dialog.confirm({
                title: "Delete Floor",
                message: "Delete this floor and all of its content?",
                confirmText: "Delete",
                variant: "danger"
              })) commit((d) => deleteFloor(d, id), "Delete floor");
            }}
            onMoveFloor={(id, dir) => commit((d) => moveFloor(d, id, dir), "Reorder floors")}
            onToggleUnderlay={(on) => commit((d) => ({ ...d, showUnderlay: on }), "Floor underlay")}
            onAddLink={(to, kind, label) =>
              commit((d) => addFloorLink(d, { from: d.activeFloorId, to, kind, label }), "Connect floors")
            }
            onRemoveLink={(id) => commit((d) => removeFloorLink(d, id), "Remove connection")}
          />
        );
      case "layers":
        return null; // Removed duplicated side panel content
      case "props":
        return <PropsPanel onPlace={placeImage} onPreview={(p) => setPreviewProp(p)} />;
      case "asset-library":
        return <AssetLibraryPanel onPlace={placeImage} />;
      case "ai":
        return (
          <AiPanel
            doc={doc}
            onPreview={setAiPreview}
            onApply={applyAi}
            staged={aiPreview}
            floorName={doc.floors.find((f) => f.id === doc.activeFloorId)?.name ?? "Ground floor"}
            onOpenHelp={openHelp}
            onOpenDiagnostics={() => setLeftPanel("diagnostics")}
            isLoggedIn={isLoggedIn}
            onAuthRequired={(reason) => {
              setAuthReason(reason);
              setAuthOpen(true);
            }}
          />
        );
      case "fog":
        return (
          <FogPanel
            count={doc.fog.length}
            mode={fogMode}
            onMode={setFogMode}
            brush={fogBrush}
            onBrush={setFogBrush}
            onHideAll={hideAllFog}
            onRevealAll={clearFog}
            activeTool={tool === "fogHide" ? "hide" : tool === "fogReveal" ? "reveal" : null}
            onTool={(t) => setTool(t === "hide" ? "fogHide" : "fogReveal")}
            style={doc.settings.fogStyle}
            softness={doc.settings.fogSoftness}
            gmOpacity={doc.settings.fogGmOpacity}
            scale={doc.settings.fogScale}
            color={doc.settings.fogColor}
            onSettings={setSettings}
          />
        );
      case "history":
        return <HistoryPanel entries={historyEntries} index={hIndex} onJump={jumpTo} />;
      case "diagnostics":
        return (
          <DiagnosticsPanel
            shapes={doc.shapes.length}
            objects={doc.objects.length}
            layers={doc.layers.length}
            fog={doc.fog.length}
            docBytes={docBytes}
            savedAt={savedAt}
            saveMs={saveMs}
            online={online}
          />
        );
      case "properties":
        return null; // Removed duplicated side panel content
      case "graphics":
        return <GraphicsSettingsPanel settings={doc.settings} onChange={setSettings} />;
      case "help":
        return <QuickStartPanel />;
      case "cms":
        return <CmsPanel />;
      case "maps":
        return (
          <MapsPanel 
            currentMapId={undefined as any} 
            onLoadMap={(id) => {
              toast.info("Loading map...");
            }}
            onNewMap={async () => {
              const ok = await dialog.confirm({
                title: "New Map",
                message: "This will clear the current canvas. Continue?",
                confirmText: "New Map",
                variant: "warning"
              });
              if (ok) commit(emptyDoc(), "New map");
            }}
          />
        );
      case "generator":
        return <GeneratorPanel doc={doc} view={view} onCommit={commit} />;
      default:
        return null;
    }
  })();

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {(!engineReady || !doc.floors.length) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">Initializing engine...</p>
          </div>
        </div>
      )}

      <TopMenuBar
        title={`${doc.floors.find((f) => f.id === doc.activeFloorId)?.name ?? "Map"}${doc.settings.playerView ? " — player view" : ""}`}
        dirty={hIndex > 0}
        canUndo={hIndex > 0}
        canRedo={hIndex < timeline.length - 1}
        onUndo={undo}
        onRedo={redo}
        onDelete={deleteSelected}
        onNew={async () => {
          if (await dialog.confirm({
            title: "New Map",
            message: "Start a new map? Unsaved changes might be lost.",
            confirmText: "New Map",
            variant: "warning"
          })) commit(emptyDoc(), "New map");
        }}
        onImport={() => importRef.current?.click()}
        onExportPng={exportPng}
        onExportSvg={exportSvg}
        onExportPdf={exportPdf}
        onExportJson={exportJson}
        onFit={fit}
        onZoomIn={() => zoomBy(1)}
        onZoomOut={() => zoomBy(-1)}
        playerView={!!doc.settings.playerView}
        onPlayerView={(v) => setSettings({ playerView: v })}
        showGrid={doc.settings.gridStyle !== "none"}
        onShowGrid={(v) => setSettings({ gridStyle: v ? "square" : "none" })}
        onOpenHelp={openHelp}
        onOpenDiagnostics={() => setLeftPanel("diagnostics")}
        onAuthRequired={(reason) => {
          setAuthReason(reason);
          setAuthOpen(true);
        }}
        right={<CloudBar doc={syncActiveFloor(doc)} thumbnail={thumbnail} onLoadDoc={(d) => commit(migrateDoc(d))} onAuthRequired={() => requireAuth("Sign in to sync your maps to the cloud and access them from anywhere.", () => {})} saveStatus={saveStatus} />}
      />

      <input
        ref={importRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = "";
        }}
      />

      <TopMenuBar
        title={doc.activeFloorId ? doc.floors.find(f => f.id === doc.activeFloorId)?.name || "Untitled Map" : "Untitled Map"}
        dirty={saveStatus === "saving"}
        canUndo={hIndex > 0}
        canRedo={hIndex < timeline.length - 1}
        onUndo={undo}
        onRedo={redo}
        onDelete={deleteSelected}
        onNew={() => {
          if (confirm("Create new map? All unsaved changes will be lost.")) {
            commit(emptyDoc(), "New map");
            setSelected([]);
          }
        }}
        onImport={() => importRef.current?.click()}
        onExportPng={() => toast.info("Exporting PNG...")}
        onExportSvg={() => exportSvgFile(doc)}
        onExportPdf={() => exportPdfFile(doc)}
        onExportJson={() => {
          const blob = new Blob([JSON.stringify(doc)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "map.ds";
          a.click();
        }}
        onFit={fit}
        onZoomIn={() => zoomBy(1)}
        onZoomOut={() => zoomBy(-1)}
        playerView={doc.settings.playerView}
        onPlayerView={(v) => setSettings({ playerView: v })}
        showGrid={doc.settings.gridStyle !== "none"}
        onShowGrid={(v) => setSettings({ gridStyle: v ? "square" : "none" })}
        onOpenHelp={openHelp}
        onAuthRequired={(reason: string) => requireAuth(reason, () => {})}
      />

      <div className="flex min-h-0 flex-1 lg:flex-row flex-col">
        <LeftRail 
          active={leftPanel} 
          onSelect={(id) => setLeftPanel((cur) => (cur === id ? null : id))} 
          animationIntensity={doc.settings.animationIntensity}
          isLoggedIn={isLoggedIn}
          onAuthRequired={(reason) => {
            setAuthReason(reason);
            setAuthOpen(true);
          }}
        />


        {leftPanel && (
          <aside 
            className="relative flex h-full shrink-0 flex-col border-r border-border bg-sidebar overflow-visible z-20"
            style={{ width: `${sidebarWidth}px` }}
            data-animation={doc.settings.animationIntensity}
          >
            <ScrollArea className="min-h-0 flex-1 h-full">
              <div className="flex flex-col gap-4 p-4 min-w-0">
                {leftContent}
              </div>
            </ScrollArea>
            <div
              onMouseDown={handleResizeMouseDown}
              className={`resize-handle ${isResizing ? "is-resizing" : ""} z-30`}
            />
          </aside>
        )}

        <ContextMenu>
        <ContextMenuTrigger asChild>
        <div
          ref={wrapRef}
          className="relative min-w-0 flex-1 touch-none select-none"
          style={{ cursor: cursorStyle }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onDoubleClick={finishPoly}
          onContextMenu={openMenu}
          onWheel={(e) => {
            if (previewProp) return;
            if (e.ctrlKey || e.metaKey) {
              // Browser zoom or custom zoom tool
              const delta = e.deltaY > 0 ? -1 : 1;
              zoomBy(delta as any);
              e.preventDefault();
            } else if (doc.settings.cameraMode) {
              // Independent camera zoom in 3D
              const delta = e.deltaY > 0 ? 1.1 : 0.9;
              setSettings({
                cameraDistance: Math.max(100, Math.min(doc.settings.maxDrawDistance, doc.settings.cameraDistance * delta))
              });
              e.preventDefault();
            } else {
              // standard pan
              setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
            }
          }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" />

          {flags.ENABLE_VIEW_CUBE && doc.settings.cameraMode && doc.settings.showViewCube && (
            <div className="absolute top-4 right-4 z-30 pointer-events-auto">
              <ViewCube 
                settings={doc.settings} 
                onUpdateSettings={setSettings}
                onResetView={() => {
                  setSettings({
                    cameraYaw: 45,
                    cameraPitch: 45,
                    cameraDistance: 1000,
                  });
                  const el = wrapRef.current;
                  if (el) {
                    setView({ x: el.clientWidth / 2, y: el.clientHeight / 2, scale: 1 });
                  }
                }}
              />
            </div>
          )}
          
          {!doc.shapes.length && !polyPts.length && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center gap-1.5 rounded-2xl border border-primary/20 bg-card/60 px-6 py-4 backdrop-blur shadow-2xl text-center">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Sparkles className="size-4 text-primary animate-pulse" />
                  <span>Ready to scrawl? Drag anywhere to draw your first room.</span>
                </div>
                <p className="max-w-xs text-[10px] leading-relaxed text-muted-foreground">
                  Scroll to zoom · Space or middle-drag to pan · Ctrl+Z to undo.
                  <br />
                  Ctrl+A to select all · Ctrl+D to deselect all.
                </p>
              </div>
            </div>
          )}

          {aiPreview && (
            <div className="absolute inset-x-0 top-4 flex justify-center px-4">
              <div className="pointer-events-auto flex max-w-xl items-center gap-3 rounded-xl border border-accent/50 bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur">
                <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-foreground">AI suggestion preview</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {aiPreview.rooms.length} rooms · {aiPreview.corridors.length} corridors · {aiPreview.objects.length} objects
                    {Object.keys(aiPreview.settings).length ? " · style tweaks" : ""}
                  </p>
                </div>
                <div className="ml-auto flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => {
                      applyAi(aiPreview);
                      setAiPreview(null);
                      toast.success("Suggestion accepted");
                    }}
                  >
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setAiPreview(null)}>
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        </ContextMenuTrigger>
        <CanvasContextMenu
          target={{ 
            label: menuTarget.label, 
            id: menuTarget.id || (selected.length === 1 ? (selected[0] ?? null) : null),
            hasSelection: selected.length > 0, 
            canPaste: clipCount > 0,
            z: doc.objects.find(o => o.id === (menuTarget.id || (selected.length === 1 ? (selected[0] ?? null) : null)))?.z
          }}
          cameraMode={doc.settings.cameraMode}
          actions={{
            onPreview: () => {
              const o = doc.objects.find(obj => selected.includes(obj.id) && obj.kind === "image");
              if (o && o.kind === "image") {
                setPreviewProp({ id: o.id, url: o.url, name: o.name || "Prop", license: (o as any).license });
              }
            },

            onCopy: copySelection,
            onCut: () => {
              copySelection();
              deleteSelected();
            },
            onUpdateZ: (z) => {
              const targetId = menuTarget.id || (selected.length === 1 ? selected[0] : null);
              if (targetId) updateObject(targetId, { z });
            },
            onPaste: () => pasteAt(menuTarget.pt),
            onDuplicate: duplicateSelection,
            onDelete: deleteSelected,
            onBringToFront: () => reorderSelection(true),
            onSendToBack: () => reorderSelection(false),
            onRotate: (deg) => rotateSelected((deg * Math.PI) / 180),
            onUpdateFilter: (filter) => {
              const obj = selectedObject;
              if (obj) updateObject(obj.id, { filter });
            },
            onSelectAll: () => setSelected([...doc.shapes.map((sh) => sh.id), ...doc.objects.map((o) => o.id)]),
            onDeselect: () => setSelected([]),
            onAdd: (kind) => addObjectAt(kind, menuTarget.pt),
            onFog: (hide) => fogAt(menuTarget.pt, hide),
            onFit: fit,
            onZoomHere: () => zoomTo(menuTarget.pt),
            imageProcessing: selectedObject?.kind === "image" ? {
              objectId: selectedObject.id,
              imageSrc: selectedObject.url,
              actions: {
                onUpdateImage: (id, url, label) => updateObject(id, { url }),
                onProcessingStart: (id) => setMenuTarget(prev => ({ ...prev, processingIds: [...prev.processingIds, id] })),
                onProcessingEnd: (id) => setMenuTarget(prev => ({ ...prev, processingIds: prev.processingIds.filter(pid => pid !== id) })),
              }
            } : undefined
          }}
        />
        </ContextMenu>

        <div className="flex w-12 shrink-0 flex-col border-l border-border bg-sidebar pt-2 overflow-hidden">
          <ScrollArea className="flex-1">
            <Toolbar
              tool={tool}
              onTool={setTool}
              onUndo={undo}
              onRedo={redo}
              canUndo={hIndex > 0}
              canRedo={hIndex < timeline.length - 1}
              zoom={view.scale}
              onZoom={zoomBy}
              vertical
              animationIntensity={doc.settings.animationIntensity}
            />
          </ScrollArea>
        </div>

        {/* PC Editor Side Panel (Hierarchy & Properties) */}
        <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-sidebar lg:flex overflow-visible relative z-20">
          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-6 p-4">
              <div>
                <h3 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scene Hierarchy</h3>
                <div className="rounded-md border bg-background/50">
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
                    onUpdateObject={updateObject}
                    onDeleteObject={deleteObject}
                    compact
                  />
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Properties Inspector</h3>
                <div className="rounded-md border bg-background/50 p-1">
                  <PropertiesPanel 
                    doc={doc} 
                    object={selectedObject} 
                    onChange={(id, patch) => {
                      if ((patch as any).preview) {
                        const o = doc.objects.find(obj => obj.id === id);
                        if (o && o.kind === "image") {
                          setPreviewProp({ id: o.id, url: o.url, name: o.name || "Prop", license: (o as any).license });
                        }
                        return;
                      }
                      if (selected.length > 1) {
                        updateSelectedObjects(patch);
                      } else {
                        updateObject(id, patch);
                      }
                    }} 
                    onDelete={deleteSelected} 
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Viewport Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold" onClick={fit}>Fit View</Button>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold" onClick={() => zoomTo({x: 0, y: 0})}>Center</Button>
                  <Button variant="outline" size="sm" className={`h-8 text-[10px] uppercase font-bold ${doc.settings.gridStyle !== 'none' ? 'bg-primary/10' : ''}`} onClick={() => setSettings({ gridStyle: doc.settings.gridStyle === 'none' ? 'square' : 'none' })}>Grid</Button>
                  <Button variant="outline" size="sm" className={`h-8 text-[10px] uppercase font-bold ${doc.settings.playerView ? 'bg-primary/10' : ''}`} onClick={() => setSettings({ playerView: !doc.settings.playerView })}>Player</Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
        
        <OnboardingOverlay />
        
        {hasDraft && (
          <div className="fixed bottom-12 left-1/2 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 rounded-full border border-accent/30 bg-background/95 px-4 py-2 shadow-lg backdrop-blur-md">
              <AlertCircle className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium">Unsaved draft detected</span>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-[10px]" onClick={recoverDraft}>Recover</Button>
                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={discardDraft}>Discard</Button>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 ml-1" onClick={discardDraft}><X className="h-3 w-3" /></Button>
            </div>
          </div>
        )}
      </div>


      <StatusBar
        toolLabel={toolLabel}
        cell={gridCoord}
        zoom={view.scale}
        shapes={doc.shapes.length}
        objects={doc.objects.length}
        fog={doc.fog.length}
        saved={savedAt ? new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
        saveStatus={saveStatus}
        onZoom={zoomBy}
        onFit={fit}
      />

      <div className="absolute top-20 right-84 z-30 flex flex-col items-end gap-2 hidden lg:flex">
        <Minimap 
          doc={doc} 
          view={view} 
          initialPos={minimapPos}
          onPositionChange={(pos) => {
            setMinimapPos(pos);
            localStorage.setItem("minimap-pos", JSON.stringify(pos));
          }}
          onNavigate={(pt) => setView((v) => ({ ...v, x: -pt.x + (wrapRef.current?.clientWidth ?? 0) / 2 / v.scale, y: -pt.y + (wrapRef.current?.clientHeight ?? 0) / 2 / v.scale }))} 
        />
        <div className="flex flex-col gap-2">
          <HelpButton 
            onClick={() => openHelp("navigation")} 
            label="Navigation"
          />
          {doc.settings.cameraMode && (
            <div className="flex flex-col gap-1 rounded-md border bg-background/95 p-1 shadow-md backdrop-blur-sm">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => zoomBy(1)}><Plus className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => zoomBy(-1)}><X className="h-3 w-3" /></Button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 lg:hidden">
        <Minimap 
          doc={doc} 
          view={view} 
          initialPos={minimapPos}
          onPositionChange={(pos) => {
            setMinimapPos(pos);
            localStorage.setItem("minimap-pos", JSON.stringify(pos));
          }}
          onNavigate={(pt) => setView((v) => ({ ...v, x: -pt.x + (wrapRef.current?.clientWidth ?? 0) / 2 / v.scale, y: -pt.y + (wrapRef.current?.clientHeight ?? 0) / 2 / v.scale }))} 
        />
        <div className="flex flex-col gap-2">
          <HelpButton 
            onClick={() => openHelp("navigation")} 
            label="Navigation"
          />
          {doc.settings.cameraMode && (
            <HelpButton 
              onClick={() => openHelp("camera")} 
              label="Camera"
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-16 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 py-1 bg-background/80 backdrop-blur rounded-lg border border-border/50 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Graphics Quality
          <HelpButton onClick={() => openHelp("right-click")} label="Filters" />
        </div>
      </div>

      
      <PropPreviewModal 
        open={!!previewProp} 
        onOpenChange={(open) => !open && setPreviewProp(null)}
        prop={previewProp}
        onAction={(action) => {
          if (!previewProp) return;
          if (action === "place") {
            placeImage(previewProp.url, previewProp.name);
            setPreviewProp(null);
          } else {
            toast.info(`Processing ${action}... (feature integration pending)`);
          }
        }}
      />
      <HelpCenter 
        isOpen={helpOpen} 
        onOpenChange={setHelpOpen} 
        initialSectionId={helpSection} 
      />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} reason={authReason} />
    </div>
  );
}





