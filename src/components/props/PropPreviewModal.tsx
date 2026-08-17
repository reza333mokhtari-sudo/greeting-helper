import { Button } from "@/components/ui/button";
import { FullscreenModal } from "@/components/ui/FullscreenModal";
import { Palette, Wand2, Scissors, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prop: {
    id: string;
    url: string;
    name: string;
    license?: string | null;
  } | null;
  onAction?: (action: string) => void;
}

export function PropPreviewModal({ open, onOpenChange, prop, onAction }: PropPreviewModalProps) {
  if (!prop) return null;

  return (
    <FullscreenModal open={open} onOpenChange={onOpenChange} title={prop.name}>
      <div className="grid h-full w-full grid-rows-[1fr_auto] gap-6 md:grid-cols-[1fr_300px] md:grid-rows-1">
        {/* Main Preview Area */}
        <div className="flex items-center justify-center rounded-lg bg-black/40 p-4 ring-1 ring-white/10">
          <img
            src={prop.url}
            alt={prop.name}
            className="max-h-full max-w-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Sidebar Controls */}
        <div className="flex flex-col gap-6 rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
          <div>
            <h2 className="mb-1 text-xl font-bold">{prop.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="border-white/20 text-white">
                ID: {prop.id.slice(0, 8)}
              </Badge>
              {prop.license && (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-500 border-amber-500/30"
                >
                  <Info className="mr-1 size-3" /> {prop.license}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              Actions
            </h3>
            <div className="grid gap-2">
              <Button
                variant="secondary"
                className="justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border-none"
                onClick={() => onAction?.("place")}
              >
                Place on Canvas
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 border-white/10 hover:bg-white/10 text-white"
                onClick={() => onAction?.("remove-bg")}
              >
                <Scissors className="size-4" /> Remove Background
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 border-white/10 hover:bg-white/10 text-white"
                onClick={() => onAction?.("pixelate")}
              >
                <Palette className="size-4" /> Pixelate
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 border-white/10 hover:bg-white/10 text-white"
                onClick={() => onAction?.("toon")}
              >
                <Wand2 className="size-4" /> Toon Filter
              </Button>
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-[10px] text-white/40 leading-relaxed">
              Use these tools to process the image before placing it. AI-powered background removal
              runs locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </FullscreenModal>
  );
}
