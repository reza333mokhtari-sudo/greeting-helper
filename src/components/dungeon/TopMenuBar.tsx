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
          <MenubarTrigger className="h-8 px-3 text-xs">where is CUBE ?</MenubarTrigger>
          <MenubarContent className="w-[450px] max-h-[80vh] overflow-y-auto p-4">
            <div className="space-y-6 text-xs">
              <div>
                <div className="font-bold border-b pb-1 uppercase mb-2">SKILLS</div>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Senior editor/camera systems (3ds Max–style viewport UX)</li>
                  <li>View Cube design and orientation snapping</li>
                  <li>Coordinate spaces (world/local), XYZ axis conventions</li>
                  <li>React + TypeScript + canvas/WebGL integration</li>
                  <li>Stable pointer-event arbitration (tools vs camera vs cube)</li>
                  <li>Regression fixing and feature flags</li>
                  <li>Performance-safe online rendering</li>
                </ul>
              </div>

              <div>
                <div className="font-bold border-b pb-1 uppercase mb-2">ROLE</div>
                <p className="text-muted-foreground leading-relaxed">
                  Build a professional camera/orientation system for my map/dungeon editor.
                  Keep the product usable online. Fix broken options. Do not leave half-working camera modes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="font-bold border-b pb-1 uppercase">GOALS</div>
                <div className="space-y-2 text-muted-foreground">
                  <p>1) Camera rotation + orientation system</p>
                  <p>2) Standard views: Top, Bottom, Left, Right, Front, Back</p>
                  <p>3) 3ds Max–like View Cube (transform cube ={">"} change view)</p>
                  <p>4) When CAMERA is ENABLED, enable 3D view behavior</p>
                  <p>5) When CAMERA is DISABLED, keep classic stable 2D editing</p>
                  <p>6) Fix conflicting options/controls</p>
                  <p>7) Prepare object placement for 3D assets (with backend in Prompt 2)</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">A) CAMERA SYSTEM</div>
                <p className="text-muted-foreground">Add Camera Enabled toggle.</p>
                <div className="pl-2 space-y-1">
                  <p className="font-semibold text-foreground/80">WHEN CAMERA ENABLED:</p>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    <li>Allow orbit rotate / pan / zoom</li>
                    <li>Smooth damping</li>
                    <li>Perspective or orthographic projection setting</li>
                    <li>Show coordinate helpers: X=Red, Y=Green, Z=Blue</li>
                    <li>Show world grid optional</li>
                    <li>Transform tools can use XYZ constraints</li>
                    <li>3D view presentation is active</li>
                  </ul>
                  <p className="font-semibold text-foreground/80 mt-2">WHEN CAMERA DISABLED:</p>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    <li>Restore original 2D map interaction</li>
                    <li>No orbit-rotate stealing tool drags</li>
                    <li>Cube can still offer Top view reset</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">B) STANDARD VIEWS</div>
                <p className="text-muted-foreground">Exact views: Top, Bottom, Left, Right, Front, Back, Home (top-down map).</p>
                <p className="text-muted-foreground italic">Animate transitions smoothly without corrupting object transforms.</p>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">C) VIEW CUBE (3ds Max style)</div>
                <ul className="list-disc pl-4 text-muted-foreground">
                  <li>Click face ={">"} jump to view</li>
                  <li>Click edge/corner ={">"} intermediate orientations</li>
                  <li>Press-hold + drag ={">"} rotate view</li>
                  <li>Release ={">"} snap to nearest standard view</li>
                  <li>RGB/XYZ cues on cube</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">D) COORDINATE SYSTEM</div>
                <ul className="list-disc pl-4 text-muted-foreground">
                  <li>World XYZ & Local object XYZ</li>
                  <li>Axis lines RGB when camera enabled</li>
                  <li>Axis constraints (X/Y/Z) for transform tools</li>
                  <li>Numeric transform fields (Pos/Rot/Scale X/Y/Z)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">E) FIX OPTIONS / CONFLICTS</div>
                <p className="text-muted-foreground">Priority: 1. Modal, 2. View Cube, 3. Tool, 4. Camera, 5. Minimap.</p>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">F) 3D WHEN CAMERA ENABLED</div>
                <p className="text-muted-foreground">Render scene in 3D-capable mode while keeping 2D content valid.</p>
              </div>
            </div>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="h-8 px-3 text-xs">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={props.onNew}>New map</MenubarItem>
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
