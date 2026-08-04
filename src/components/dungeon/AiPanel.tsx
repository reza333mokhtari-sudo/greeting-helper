import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { suggestMap, type AiSuggestion } from "@/lib/ai.functions";
import type { Doc } from "@/lib/dungeon/model";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Mode = "rooms" | "encounter" | "hatching" | "refine";

const MODES: { id: Mode; label: string; placeholder: string }[] = [
  { id: "rooms", label: "Suggest rooms", placeholder: "A goblin warren with a flooded shrine and 3 side chambers" },
  { id: "encounter", label: "Encounters", placeholder: "Level 3 party, undead theme, one trap and one social encounter" },
  { id: "hatching", label: "Wall / hatching style", placeholder: "Old hand-inked style, heavy hatching, rough walls" },
  { id: "refine", label: "Refine this map", placeholder: "Make the corridors tighter and add a secret vault" },
];

/** Short text summary so the model can reason about the current map. */
function summarise(doc: Doc): string {
  const g = doc.settings.gridSize;
  const rooms = doc.shapes
    .filter((s) => !s.erase && (s.kind === "rect" || s.kind === "ellipse"))
    .slice(0, 20)
    .map((s) =>
      s.kind === "rect" || s.kind === "ellipse"
        ? `${s.kind} at ${Math.round(s.a.x / g)},${Math.round(s.a.y / g)} size ${Math.round(Math.abs(s.b.x - s.a.x) / g)}x${Math.round(
            Math.abs(s.b.y - s.a.y) / g,
          )}`
        : "",
    );
  const objs = doc.objects.slice(0, 25).map((o) => `${o.kind}${o.name ? `(${o.name})` : ""}`);
  return [
    `${doc.shapes.length} shapes, ${doc.objects.length} objects`,
    rooms.length ? `rooms: ${rooms.join("; ")}` : "",
    objs.length ? `objects: ${objs.join(", ")}` : "",
    `style: grid ${doc.settings.gridStyle}, hatch ${doc.settings.hatch}, roughness ${doc.settings.roughness}`,
  ]
    .filter(Boolean)
    .join(". ")
    .slice(0, 3500);
}

type Props = {
  doc: Doc;
  onApply: (s: AiSuggestion) => void;
};

export function AiPanel({ doc, onApply }: Props) {
  const run = useServerFn(suggestMap);
  const [mode, setMode] = useState<Mode>("rooms");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AiSuggestion | null>(null);

  const ask = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await run({
        data: { prompt: prompt.trim(), summary: summarise(doc), mode, gridSize: doc.settings.gridSize },
      });
      setResult(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      toast.error(msg.includes("402") ? "AI credits exhausted — add credits to keep generating." : msg.includes("429") ? "Too many AI requests, try again shortly." : msg);
    }
    setBusy(false);
  };

  const active = MODES.find((m) => m.id === mode)!;

  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-accent" /> AI cartographer
      </h2>
      <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <SelectTrigger className="h-7 text-[11px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODES.map((m) => (
            <SelectItem key={m.id} value={m.id} className="text-[11px]">
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={active.placeholder}
        rows={3}
        className="text-[11px]"
      />
      <Button size="sm" className="h-7 w-full text-[11px]" disabled={busy || !prompt.trim()} onClick={ask}>
        {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
        {busy ? "Thinking…" : "Ask the AI"}
      </Button>

      {result && (
        <div className="space-y-2 rounded-md border border-border/60 bg-card/60 p-2">
          {result.notes && <p className="text-[11px] leading-relaxed text-muted-foreground">{result.notes}</p>}
          <div className="flex flex-wrap gap-1">
            {result.rooms.length > 0 && <Badge variant="secondary" className="text-[9px]">{result.rooms.length} rooms</Badge>}
            {result.corridors.length > 0 && <Badge variant="secondary" className="text-[9px]">{result.corridors.length} corridors</Badge>}
            {Object.keys(result.settings).length > 0 && <Badge variant="secondary" className="text-[9px]">style tweaks</Badge>}
          </div>
          {result.encounters.length > 0 && (
            <ul className="space-y-1">
              {result.encounters.map((e, i) => (
                <li key={i} className="text-[11px]">
                  <span className="font-medium text-foreground">{e.name}</span>
                  <span className="text-muted-foreground"> — {e.description}</span>
                </li>
              ))}
            </ul>
          )}
          {(result.rooms.length > 0 || result.corridors.length > 0 || Object.keys(result.settings).length > 0) && (
            <Button size="sm" variant="secondary" className="h-6 w-full text-[10px]" onClick={() => onApply(result)}>
              Apply to map
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
