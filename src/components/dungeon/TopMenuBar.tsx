import { useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Map, User } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { HealthCheckIndicator } from "./HealthCheckIndicator";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  onOpenDiagnostics?: () => void;
  onAuthRequired?: (reason: string) => void;
};

export function TopMenuBar(props: Props & { onOpenHelp: (sectionId?: string) => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data.user);
    });
  }, []);

  return (
    <header className="relative flex h-14 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-3">
      <Link to="/" className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/50 rounded-md transition-colors mr-2">
        <div className="size-6 bg-primary rounded flex items-center justify-center">
          <Map className="size-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm tracking-tight text-foreground">DUNGEON SCRAWL</span>
      </Link>


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
          <MenubarTrigger className="h-8 px-3 text-xs">AI</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={props.onOpenDiagnostics ?? (() => {})}>
              AI Reasoning Diagnostics
            </MenubarItem>
            <MenubarItem onSelect={() => props.onOpenHelp("ai-assistant")}>
              AI Help & Documentation
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="h-8 px-3 text-xs">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => props.onOpenHelp("quick-start")}>
              Documentation
            </MenubarItem>
            <MenubarItem onSelect={() => props.onOpenHelp("shortcuts")}>
              Keyboard Shortcuts
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2 py-1">Cheat Sheet</MenubarItem>
            <MenubarItem disabled className="text-xs py-1">R / B — Room / Brush</MenubarItem>
            <MenubarItem disabled className="text-xs py-1">D / S — Door / Stairs</MenubarItem>
            <MenubarItem disabled className="text-xs py-1">E — Toggle Erase</MenubarItem>
            <MenubarItem disabled className="text-xs py-1">Space — Pan View</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-foreground/80">
        {props.title}
        {props.dirty ? <span className="ml-2 text-[10px] text-amber-500 animate-pulse font-bold">● Saving…</span> : null}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {props.right}
        {user ? (
          <ProfileMenu onAuthRequired={props.onAuthRequired} />
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/5 hover:text-primary transition-all"
            asChild
          >
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
      </div>

    </header>
  );
}
