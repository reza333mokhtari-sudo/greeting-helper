import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sliders, Layers, Image, Sparkles, CloudFog, History, Info, Activity, Building2, HelpCircle, Monitor, FileText, Map as MapIcon, Wand2, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PanelId = "settings" | "floors" | "layers" | "props" | "asset-library" | "ai" | "fog" | "history" | "properties" | "diagnostics" | "help" | "graphics" | "cms" | "maps" | "generator";

const PANELS: { id: PanelId; label: string; icon: LucideIcon; shortcut?: string }[] = [
  { id: "settings", label: "Tool & map settings", icon: Sliders, shortcut: "Alt+S" },
  { id: "graphics", label: "Graphics & camera", icon: Monitor, shortcut: "Alt+G" },
  { id: "maps", label: "My Maps", icon: MapIcon, shortcut: "Alt+M" },
  { id: "generator", label: "Procedural Generator", icon: Wand2, shortcut: "Alt+G" },
  { id: "floors", label: "Floors & connections", icon: Building2, shortcut: "Alt+F" },
  { id: "props", label: "My Props & textures", icon: Image, shortcut: "Alt+P" },
  { id: "asset-library", label: "Soulslike Asset Library", icon: Package, shortcut: "Alt+K" },
  { id: "ai", label: "AI assistant", icon: Sparkles, shortcut: "Alt+A" },
  { id: "fog", label: "Fog of war", icon: CloudFog, shortcut: "Alt+W" },
  { id: "history", label: "History", icon: History, shortcut: "Alt+H" },
  { id: "help", label: "Quick help", icon: HelpCircle, shortcut: "F1" },
  { id: "diagnostics", label: "Performance diagnostics", icon: Activity, shortcut: "Alt+D" },
  { id: "cms", label: "CMS Pages", icon: FileText },
];

type Props = {
  active: PanelId | null;
  onSelect: (id: PanelId) => void;
  animationIntensity?: number;
  isLoggedIn?: boolean;
  onAuthRequired?: (reason: string) => void;
};

export function LeftRail({ active, onSelect, animationIntensity = 2, isLoggedIn, onAuthRequired }: Props) {
  const handleSelect = (p: typeof PANELS[0]) => {
    if (!isLoggedIn && (p.id === "ai" || p.id === "props" || p.id === "maps")) {
      onAuthRequired?.(`Sign in to access ${p.label}.`);
      return;
    }
    onSelect(p.id);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav 
        className="flex w-10 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-1.5"
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
                  onClick={() => handleSelect(p)}
                  className={`size-8 group transition-all duration-200 ${on ? "text-primary bg-primary/10 shadow-[0_0_12px_rgba(var(--primary),0.15)]" : "text-foreground/50 hover:text-foreground hover:bg-muted/50"} ${!isLoggedIn && (p.id === "ai" || p.id === "props" || p.id === "maps") ? "opacity-40" : ""}`}
                >

                  <Icon className={`size-[16px] transition-all duration-300 ease-out group-hover:scale-105 group-hover:rotate-[2deg] group-active:scale-95 ${on ? "animate-in fade-in zoom-in duration-300" : ""}`} />
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
