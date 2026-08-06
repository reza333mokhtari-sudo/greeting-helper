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
          <MenubarContent className="w-[500px] max-h-[85vh] overflow-y-auto p-4">
            <div className="space-y-6 text-xs">
              <div>
                <div className="font-bold border-b pb-1 uppercase mb-2">SKILLS</div>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Asset pipeline engineering</li>
                  <li>glTF/GLB online runtime loading</li>
                  <li>File validation and conversion backends</li>
                  <li>Thumbnail generation</li>
                  <li>Secure uploads and storage</li>
                  <li>TanStack Start server functions / API design</li>
                  <li>Python workers for heavy conversion (core.py)</li>
                  <li>JS/TS runtime core (core.js)</li>
                </ul>
              </div>

              <div>
                <div className="font-bold border-b pb-1 uppercase mb-2">ROLE</div>
                <p className="text-muted-foreground leading-relaxed">
                  Add backend-supported 3D object import/placement like modern scrawl/map tools, without breaking the editor.
                </p>
              </div>

              <div className="space-y-4">
                <div className="font-bold border-b pb-1 uppercase">GOAL</div>
                <p className="text-muted-foreground">
                  Users can add 3D objects into the site/library and place them on the map:
                  trees, bosses, NPCs, props, stairs, rocks, etc.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">FORMAT POLICY (REALISTIC)</div>
                <p className="text-muted-foreground font-semibold">Runtime in browser:</p>
                <ul className="list-disc pl-4 text-muted-foreground">
                  <li>Primary: .glb / .gltf</li>
                  <li>Secondary: .obj</li>
                </ul>
                <p className="text-muted-foreground font-semibold mt-2">Backend conversion (best-effort):</p>
                <p className="text-muted-foreground">.fbx .dae .stl .ply .3ds -{">"} optimized .glb</p>
                <p className="text-muted-foreground italic mt-1 text-[10px]">
                  Do not claim impossible native support for proprietary app formats (.max/.blend native) in-browser.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">BACKEND ARCHITECTURE</div>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground/80">1) core.js</p>
                    <p className="text-muted-foreground text-[10px]">Load GLB/OBJ, normalize scale, place in scene, serialize refs.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground/80">2) core.py</p>
                    <p className="text-muted-foreground text-[10px]">Validate, convert to GLB, optimize mesh, generate thumbnail, return metadata (polycount, bbox).</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground/80">API Endpoints:</p>
                    <code className="block bg-muted p-1 rounded text-[10px] text-muted-foreground">
                      POST /api/assets/import<br/>
                      GET /api/assets/:id<br/>
                      GET /api/assets (library)<br/>
                      POST /api/assets/optimize
                    </code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">EDITOR INTEGRATION</div>
                <ul className="list-disc pl-4 text-muted-foreground">
                  <li>Asset library categories: Nature, Structures, Characters, Stairs, Rocks, Imported</li>
                  <li>Drag/drop or click-to-place onto map</li>
                  <li>Auto-scale & Drop to floor/elevation</li>
                  <li>Works with Camera Enabled 3D view</li>
                  <li>Visible in Top view & Transform persistence</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-bold border-b pb-1 uppercase">ACCEPTANCE</div>
                <ul className="list-disc pl-4 text-muted-foreground">
                  <li>Upload GLB works end-to-end</li>
                  <li>Converted FBX/OBJ path works or cleanly errors</li>
                  <li>Place tree/boss/npc on map</li>
                  <li>Transforms persist</li>
                  <li>Backend returns thumbnail + metadata</li>
                </ul>
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
