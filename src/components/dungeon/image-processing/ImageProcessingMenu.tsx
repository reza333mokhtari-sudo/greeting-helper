
import React, { useState } from "react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  ImageIcon,
  Wand2,
  Palette,
  MinusCircle,
  Sun,
  Contrast,
  CircleDashed,
  Wind,
  Layers,
} from "lucide-react";
import { removeBackground, pixelate, toonify, applyFilter } from "@/lib/image-processing/processors";
import { toast } from "sonner";

export type ImageProcessingActions = {
  onUpdateImage: (id: string, newUrl: string, label: string) => void;
  onProcessingStart: (id: string) => void;
  onProcessingEnd: (id: string) => void;
};

export function ImageProcessingMenu({
  objectId,
  imageSrc,
  actions,
}: {
  objectId: string;
  imageSrc: string;
  actions: ImageProcessingActions;
}) {
  const [processing, setProcessing] = useState(false);

  const runProcessor = async (
    label: string,
    processor: (src: string) => Promise<string>
  ) => {
    if (processing) return;
    setProcessing(true);
    actions.onProcessingStart(objectId);
    const tid = toast.loading(`Processing: ${label}...`);

    try {
      const result = await processor(imageSrc);
      actions.onUpdateImage(objectId, result, label);
      toast.success(`${label} applied`, { id: tid });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to apply ${label}`, { id: tid });
    } finally {
      setProcessing(false);
      actions.onProcessingEnd(objectId);
    }
  };

  return (
    <>
      <ContextMenuSeparator />
      <ContextMenuLabel className="text-[10px] uppercase tracking-wider flex items-center gap-2">
        <ImageIcon className="size-3" /> Image Effects
      </ContextMenuLabel>
      
      <ContextMenuItem onSelect={() => runProcessor("Remove Background", removeBackground)}>
        <MinusCircle className="mr-2 size-3.5" /> Remove Background
      </ContextMenuItem>

      <ContextMenuItem onSelect={() => runProcessor("Toon", toonify)}>
        <Wand2 className="mr-2 size-3.5" /> Toon / Cartoon
      </ContextMenuItem>

      <ContextMenuItem onSelect={() => runProcessor("Pixelate", (src) => pixelate(src, 8))}>
        <Palette className="mr-2 size-3.5" /> Pixelate
      </ContextMenuItem>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Layers className="mr-2 size-3.5" /> Filters
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-48">
          <ContextMenuItem onSelect={() => runProcessor("Grayscale", (src) => applyFilter(src, "grayscale(1)"))}>
            Grayscale
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => runProcessor("Sepia", (src) => applyFilter(src, "sepia(1)"))}>
            Sepia
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => runProcessor("Invert", (src) => applyFilter(src, "invert(1)"))}>
            Invert
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => runProcessor("Blur", (src) => applyFilter(src, "blur(4px)"))}>
            Blur
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => runProcessor("Contrast+", (src) => applyFilter(src, "contrast(1.5)"))}>
            <Contrast className="mr-2 size-3.5" /> Contrast +
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => runProcessor("Contrast-", (src) => applyFilter(src, "contrast(0.7)"))}>
            <Contrast className="mr-2 size-3.5" /> Contrast -
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => runProcessor("Brightness+", (src) => applyFilter(src, "brightness(1.3)"))}>
            <Sun className="mr-2 size-3.5" /> Brightness +
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => runProcessor("Brightness-", (src) => applyFilter(src, "brightness(0.7)"))}>
            <Sun className="mr-2 size-3.5" /> Brightness -
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </>
  );
}
