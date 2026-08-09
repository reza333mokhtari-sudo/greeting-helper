import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sliders, Layers, Image, Sparkles, CloudFog, History, Info, Activity, Building2, HelpCircle, Monitor, FileText, Map as MapIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PanelId = "settings" | "floors" | "layers" | "props" | "ai" | "fog" | "history" | "properties" | "diagnostics" | "help" | "graphics" | "cms" | "maps";

const PANELS: { id: PanelId; label: string; icon: LucideIcon; shortcut?: string }[] = [
  { id: "settings", label: "Tool & map settings", icon: Sliders, shortcut: "Alt+S" },
  { id: "graphics", label: "Graphics & camera", icon: Monitor, shortcut: "Alt+G" },
  { id: "maps", label: "My Maps", icon: MapIcon, shortcut: "Alt+M" },
  { id: "floors", label: "Floors & connections", icon: Building2, shortcut: "Alt+F" },
  { id: "layers", label: "Layers", icon: Layers, shortcut: "Alt+L" },
  { id: "props", label: "Props & textures", icon: Image, shortcut: "Alt+P" },
  { id: "ai", label: "AI assistant", icon: Sparkles, shortcut: "Alt+A" },
  { id: "fog", label: "Fog of war", icon: CloudFog, shortcut: "Alt+W" },
  { id: "history", label: "History", icon: History, shortcut: "Alt+H" },
  { id: "properties", label: "Properties", icon: Info, shortcut: "Alt+I" },
  { id: "help", label: "Quick help", icon: HelpCircle, shortcut: "F1" },
  { id: "diagnostics", label: "Performance diagnostics", icon: Activity, shortcut: "Alt+D" },
  { id: "cms", label: "CMS Pages", icon: FileText },
];

type Props = {
  active: PanelId | null;
  onSelect: (id: PanelId) => void;
  animationIntensity?: number;
};

export function LeftRail({ active, onSelect, animationIntensity = 2 }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <nav 
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-2"
        data-animation={animationIntensity}
      >
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
                  className={`size-9 group transition-all duration-300 ${on ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]" : "text-foreground/60 hover:text-foreground hover:bg-muted"}`}
                >
                  <Icon className={`size-[18px] transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-[5deg] group-active:scale-95 ${on ? "animate-in fade-in zoom-in duration-500 spin-in-6" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{p.label}</span>
                {p.shortcut && <span className="text-[10px] opacity-60 font-mono">({p.shortcut})</span>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
