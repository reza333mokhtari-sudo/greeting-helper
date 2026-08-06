import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ClipboardPaste,
  Copy,
  CloudFog,
  Eye,
  Lightbulb,
  Maximize2,
  MousePointerSquareDashed,
  RotateCw,
  Scissors,
  Trash2,
  Type,
  User,
  Image as ImageIcon,
  Wand2,
  Palette,
  Box,
} from "lucide-react";
import { ImageProcessingMenu } from "./image-processing/ImageProcessingMenu";

export type CanvasMenuTarget = {
  /** Name of the object/shape under the cursor, if any. */
  label: string | null;
  id: string | null;
  hasSelection: boolean;
  canPaste: boolean;
  z?: number | undefined;
};

export type CanvasMenuActions = {
  onPreview: () => void;

  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onRotate: (deg: number) => void;
  onUpdateFilter: (filter: "none" | "pixel" | "toon" | "remove-bg") => void;
  onUpdateZ?: (z: number) => void;
  onSelectAll: () => void;
  onDeselect: () => void;
  onAdd: (kind: "npc" | "item" | "trigger" | "light" | "text") => void;
  onFog: (hide: boolean) => void;
  onFit: () => void;
  onZoomHere: () => void;
  imageProcessing?: {
    objectId: string;
    imageSrc: string;
    actions: {
      onUpdateImage: (id: string, newUrl: string, label: string) => void;
      onProcessingStart: (id: string) => void;
      onProcessingEnd: (id: string) => void;
    };
  } | undefined;
};

/** Right-click menu for the map canvas. */
export function CanvasContextMenu({ target, actions, cameraMode }: { target: CanvasMenuTarget; actions: CanvasMenuActions; cameraMode: boolean }) {
  const sel = target.hasSelection;
  return (
    <ContextMenuContent className="w-60">
      <ContextMenuLabel className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {target.label ?? "Canvas"}
      </ContextMenuLabel>
      <ContextMenuSeparator />
      
      {cameraMode && target.id && (
        <>
          <ContextMenuLabel className="text-[10px] py-1">3D Properties</ContextMenuLabel>
          <div className="px-2 py-1.5 flex items-center gap-2">
             <span className="text-[10px] text-muted-foreground w-8">Z Pos:</span>
             <input 
                type="number" 
                className="h-6 w-full bg-muted border border-border rounded px-1 text-[10px]"
                value={target.z ?? 0}
                step={1}
                onChange={(e) => actions.onUpdateZ?.(parseFloat(e.target.value) || 0)}
                onClick={(e) => e.stopPropagation()}
             />
          </div>
          <ContextMenuSeparator />
        </>
      )}

      <ContextMenuItem disabled={!sel || target.label === "shape"} onSelect={actions.onPreview}>
        <Maximize2 className="mr-2 size-3.5" /> View Fullscreen
      </ContextMenuItem>


      <ContextMenuItem disabled={!sel} onSelect={actions.onCopy}>
        <Copy className="mr-2 size-3.5" /> Copy
        <ContextMenuShortcut>⌘C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem disabled={!sel} onSelect={actions.onCut}>
        <Scissors className="mr-2 size-3.5" /> Cut
        <ContextMenuShortcut>⌘X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem disabled={!target.canPaste} onSelect={actions.onPaste}>
        <ClipboardPaste className="mr-2 size-3.5" /> Paste here
        <ContextMenuShortcut>⌘V</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem disabled={!sel} onSelect={actions.onDuplicate}>
        <Copy className="mr-2 size-3.5" /> Duplicate
        <ContextMenuShortcut>⌘D</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem disabled={!sel} className="text-destructive focus:text-destructive" onSelect={actions.onDelete}>
        <Trash2 className="mr-2 size-3.5" /> Delete
        <ContextMenuShortcut>⌫</ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuSub>
        <ContextMenuSubTrigger disabled={!sel || target.label === "shape"}>
          <Palette className="mr-2 size-3.5" /> Visual Filter
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-48">
          <ContextMenuItem onSelect={() => actions.onUpdateFilter("none")}>
            <ImageIcon className="mr-2 size-3.5" /> No Filter
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onUpdateFilter("pixel")}>
            <Palette className="mr-2 size-3.5" /> Pixel Graphics
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onUpdateFilter("toon")}>
            <Wand2 className="mr-2 size-3.5" /> Toon Style
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onUpdateFilter("remove-bg")}>
            <ImageIcon className="mr-2 size-3.5" /> Remove Background
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      {actions.imageProcessing && (
        <ImageProcessingMenu
          objectId={actions.imageProcessing.objectId}
          imageSrc={actions.imageProcessing.imageSrc}
          actions={actions.imageProcessing.actions}
        />
      )}

      <ContextMenuSeparator />

      <ContextMenuItem disabled={!sel} onSelect={actions.onBringToFront}>
        <ArrowUpToLine className="mr-2 size-3.5" /> Bring to front
      </ContextMenuItem>
      <ContextMenuItem disabled={!sel} onSelect={actions.onSendToBack}>
        <ArrowDownToLine className="mr-2 size-3.5" /> Send to back
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger disabled={!sel}>
          <RotateCw className="mr-2 size-3.5" /> Rotate
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onSelect={() => actions.onRotate(15)}>+15°</ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onRotate(45)}>+45°</ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onRotate(90)}>+90°</ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onRotate(-90)}>−90°</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <User className="mr-2 size-3.5" /> Place here
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onSelect={() => actions.onAdd("npc")}>
            <User className="mr-2 size-3.5" /> NPC
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onAdd("item")}>
            <Copy className="mr-2 size-3.5" /> Item
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onAdd("trigger")}>
            <MousePointerSquareDashed className="mr-2 size-3.5" /> Trigger
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onAdd("light")}>
            <Lightbulb className="mr-2 size-3.5" /> Light
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => actions.onAdd("text")}>
            <Type className="mr-2 size-3.5" /> Label
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuItem onSelect={() => actions.onFog(false)}>
        <Eye className="mr-2 size-3.5" /> Reveal fog here
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => actions.onFog(true)}>
        <CloudFog className="mr-2 size-3.5" /> Hide under fog
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={actions.onSelectAll}>Select all</ContextMenuItem>
      <ContextMenuItem disabled={!sel} onSelect={actions.onDeselect}>
        Deselect
      </ContextMenuItem>
      <ContextMenuItem onSelect={actions.onZoomHere}>Zoom in here</ContextMenuItem>
      <ContextMenuItem onSelect={actions.onFit}>
        <Maximize2 className="mr-2 size-3.5" /> Fit map
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
