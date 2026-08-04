import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sliders, Layers, Image, Sparkles, CloudFog, History, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PanelId = "settings" | "layers" | "props" | "ai" | "fog" | "history" | "properties";

const PANELS: { id: PanelId; label: string; icon: LucideIcon }[] = [
  { id: "settings", label: "Tool & map settings", icon: Sliders },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "props", label: "Props & textures", icon: Image },
  { id: "ai", label: "AI assistant", icon: Sparkles },
  { id: "fog", label: "Fog of war", icon: CloudFog },
  { id: "history", label: "History", icon: History },
  { id: "properties", label: "Properties", icon: Info },
];

type Props = {
  active: PanelId | null;
  onSelect: (id: PanelId) => void;
};

export function LeftRail({ active, onSelect }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-2">
        {PANELS.map((p) => {
          const Icon = p.icon;
          const on = active === p.id;
          return (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={on ? "secondary" : "ghost"}
                  size="icon"
                  aria-label={p.label}
                  aria-pressed={on}
                  onClick={() => onSelect(p.id)}
                  className={on ? "size-9 text-primary" : "size-9 text-foreground/60"}
                >
                  <Icon className="size-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{p.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
