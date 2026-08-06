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
          <MenubarTrigger className="h-8 px-3 text-xs">Improve the right sidebar tools so I can quickly switch between drag preview correction and placement correction modes for movable objects.{"\n\n"}also remove duplicate of XYZ-RGB lines from middle of EDITOR</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled className="whitespace-pre-line text-[10px] text-muted-foreground">
              {"Add a debug overlay that shows the computed world point under the cursor and where the object will be placed when I click or drag.\n\nEnsure the coordinate correction stays accurate after switching Camera Mode on/off and after changing orbit/pan/zoom settings by persisting the active camera transform.\n\nCorrect any offset between the drag preview position and the final placed coordinates for each tool.\n\ni want this LINE OF XYZ RGB in BOTTOM LEFT CORNER(has padding)"}
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
