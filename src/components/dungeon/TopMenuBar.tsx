import type { ReactNode } from "react";
import { ProfileMenu } from "./ProfileMenu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

type Props = {
  title: string;
  dirty?: boolean;
  right?: ReactNode;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onNew: () => void;
  onImport: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  playerView: boolean;
  onPlayerView: (v: boolean) => void;
  showGrid: boolean;
  onShowGrid: (v: boolean) => void;
};

export function TopMenuBar(props: Props) {
  return (
    <header className="relative flex h-11 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-2">
      <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-arcane">Scrawl</span>
      <Menubar className="h-8 border-0 bg-transparent p-0 shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="h-8 px-3 text-xs">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={props.onNew}>Work like a senior engine programmer. Inspect existing code first, implement in vertical slices, avoid breaking current map data, keep TypeScript clean, and end with changed files + exact test steps.\n\n\nSKILLS\n- Real-time rendering optimization\n- Quality presets for web devices\n- Editor settings UX\n\nGOAL\nAdd smooth graphics/camera settings for online use.\n\nPRESETS\n- Low / Medium / High / Ultra\n\nTOGGLES\n- Shadows\n- Anti-aliasing\n- Grid / axes\n- Render scale\n- Max texture size\n- Max draw distance\n- Damping\n\nRULES\n- Stable on laptop + mid mobile\n- Pause heavy work when tab hidden\n- Settings persist\n\n\n\nSKILLS\n- glTF/GLB runtime loading\n- Asset pipeline design\n- Mesh normalization, bounds, thumbnails\n- Online performance budgets\n- Optional Python conversion workers\n\nGOAL\nAllow placing 3D assets online (trees, bosses, NPCs, mountains, stairs, etc.).\n\nRUNTIME SUPPORT\n- Primary: .glb / .gltf\n- Secondary: .obj\n- Do NOT fake native support for all proprietary formats\n\nBACKEND PIPELINE (core.py + API)\n- Accept best-effort uploads: fbx/dae/stl/ply/3ds\n- Convert to optimized GLB\n- Generate thumbnail + bounds + polycount metadata\n- Reject oversized/unsafe files\n\nEDITOR FEATURES\n- Asset library categories\n- Drag/click place into world\n- Auto-scale + drop to floor\n- Transform with camera gizmos\n- Save asset refs in map document\n\nCORE SPLIT\n- core.js: scene, camera, objects, loaders, serialization\n- core.py: convert/optimize/thumbnail worker\n\nQUALITY\n- FPS-safe\n- Instancing where possible\n- Clear import progress + errors\n\n\n\nSKILLS\n- Expert Three.js / WebGL editor camera systems\n- DCC-style viewport UX (Blender / Dungeon Scrawl inspired)\n- React + TypeScript + TanStack Start\n- Smooth damping, input systems (mouse + touch)\n- Gizmo / axis helper rendering\n- Performance-safe online rendering\n\nGOAL\nAdd a professional CAMERA MODE to my dungeon editor.\n\nREQUIREMENTS\n1) Toggle: Camera Mode ON/OFF\n2) When ON:\n   - Orbit rotate (left-drag)\n   - Pan (right/middle-drag)\n   - Zoom (wheel)\n   - Touch: 1-finger orbit, 2-finger pan/zoom\n3) Smooth damping / inertia (no jitter)\n4) Show XYZ axis guides in RGB:\n   - X = Red\n   - Y = Green\n   - Z = Blue\n5) Corner axis widget + optional world-origin axes\n6) Settings panel:\n   - FOV, sensitivity, invert Y\n   - min/max pitch, min/max zoom\n   - damping strength\n   - show grid / show axes\n   - perspective / orthographic\n7) Reset camera + Frame selection\n8) Do NOT break existing 2D editing when Camera Mode is OFF\n9) No route navigation side effects\n10) Persist camera settings in editor state\n\nIMPLEMENTATION\n- Inspect current canvas/editor architecture first\n- Integrate cleanly with existing map/props system\n- Prefer maintainable architecture (Three.js or hybrid 2D+3D viewport)\n- TypeScript, clean modular code (camera controller, settings, helpers)\n\nACCEPTANCE\n- Camera feels smooth like a real editor\n- RGB/XYZ visible only when camera enabled\n- Existing props still selectable/editable\n- Works online with stable FPS</MenubarItem>

            <MenubarItem onSelect={props.onImport}>Import savefile…</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={props.onExportPng}>Export PNG</MenubarItem>
            <MenubarItem onSelect={props.onExportSvg}>Export SVG</MenubarItem>
            <MenubarItem onSelect={props.onExportPdf}>Export PDF</MenubarItem>
            <MenubarItem onSelect={props.onExportJson}>Save as .ds file (Manual save)</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="h-8 px-3 text-xs">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled={!props.canUndo} onSelect={props.onUndo}>
              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!props.canRedo} onSelect={props.onRedo}>
              Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={props.onDelete}>
              Delete selection <MenubarShortcut>⌫</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="h-8 px-3 text-xs">View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={props.onZoomIn}>Zoom in</MenubarItem>
            <MenubarItem onSelect={props.onZoomOut}>Zoom out</MenubarItem>
            <MenubarItem onSelect={props.onFit}>Fit map to screen</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={() => props.onShowGrid(!props.showGrid)}>
              {props.showGrid ? "Hide grid" : "Show grid"}
            </MenubarItem>
            <MenubarItem onSelect={() => props.onPlayerView(!props.playerView)}>
              {props.playerView ? "Leave player view" : "Player view"}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="h-8 px-3 text-xs">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Shortcuts</MenubarItem>
            <MenubarItem disabled>R / B — Draw Room / Brush</MenubarItem>
            <MenubarItem disabled>D / S — Door / Stairs</MenubarItem>
            <MenubarItem disabled>E — Toggle Erase Mode</MenubarItem>
            <MenubarItem disabled>Ctrl+A — Select All</MenubarItem>
            <MenubarItem disabled>Ctrl+D — Deselect All</MenubarItem>
            <MenubarItem disabled>Space — Pan View</MenubarItem>
            <MenubarItem disabled>Scroll — Zoom</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={() => window.open('https://dungeonscrawl.com/docs', '_blank')}>
              Documentation
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-foreground/80">
        {props.title}
        {props.dirty ? <span className="ml-2 text-[10px] text-muted-foreground">Unsaved changes</span> : null}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ProfileMenu />
        {props.right}
      </div>
    </header>
  );
}
