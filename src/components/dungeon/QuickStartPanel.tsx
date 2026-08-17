import { WORKFLOWS } from "@/lib/dungeon/onboarding";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ChevronRight } from "lucide-react";

export function QuickStartPanel() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Lightbulb className="size-3 text-primary" />
        Quick Start Guides
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3 pr-4">
          {WORKFLOWS.map((w) => (
            <div
              key={w.id}
              className="group rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:border-primary/30"
            >
              <h3 className="mb-2 text-xs font-bold flex items-center justify-between">
                {w.title}
                <ChevronRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <ul className="space-y-1.5">
                {w.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[10px] leading-tight text-muted-foreground"
                  >
                    <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-border p-3 text-center">
            <p className="text-[10px] text-muted-foreground italic">
              Need more help? Check out our FAQ in the profile menu.
            </p>
          </div>
        </div>
      </ScrollArea>
    </section>
  );
}
