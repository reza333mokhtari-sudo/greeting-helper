import { History, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export type HistoryEntry = { label: string; at: number };

type Props = {
  entries: HistoryEntry[];
  /** Index into entries of the state currently shown. */
  index: number;
  onJump: (index: number) => void;
};

export function HistoryPanel({ entries, index, onJump }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <History className="h-3 w-3" /> History
      </h2>
      <ScrollArea className="h-40 rounded-md border border-border/60 bg-card/40">
        <ul className="p-1">
          {entries.map((e, i) => {
            const active = i === index;
            const future = i > index;
            return (
              <li key={`${e.at}-${i}`}>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] transition-colors ${
                    active
                      ? "bg-primary/20 text-foreground"
                      : future
                        ? "text-muted-foreground/50 hover:bg-muted/40"
                        : "text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <RotateCcw
                    className={`h-2.5 w-2.5 shrink-0 ${active ? "text-primary" : "opacity-40"}`}
                  />
                  <span className="truncate">{e.label}</span>
                  <span className="ml-auto shrink-0 text-[9px] tabular-nums opacity-60">
                    {new Date(e.at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-full text-[10px]"
        disabled={index <= 0}
        onClick={() => onJump(0)}
      >
        Back to start
      </Button>
    </section>
  );
}
