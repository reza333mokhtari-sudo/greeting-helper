import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, WifiOff, Cpu } from "lucide-react";
import { toast } from "sonner";

import { suggestMap, AI_ENGINES, type AiSuggestion, type AiEngine } from "@/lib/ai.functions";
import type { Doc } from "@/lib/dungeon/model";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Mode = "rooms" | "encounter" | "hatching" | "refine";


const MODES: { id: Mode; label: string; placeholder: string; chips: string[] }[] = [
  {
    id: "rooms",
    label: "Suggest rooms",
    placeholder: "A goblin warren with a flooded shrine and 3 side chambers",
    chips: ["Small 5-room crypt", "Sprawling sewer network", "Wizard tower ground floor"],
  },
  {
    id: "encounter",
    label: "Encounters",
    placeholder: "Level 3 party, undead theme, one trap and one social encounter",
    chips: ["Level 3, undead", "Non-combat puzzle", "Boss fight finale"],
  },
  {
    id: "hatching",
    label: "Wall / hatching style",
    placeholder: "Old hand-inked style, heavy hatching, rough walls",
    chips: ["Hand-inked, heavy hatch", "Clean blueprint", "Weathered parchment"],
  },
  {
    id: "refine",
    label: "Refine this map",
    placeholder: "Make the corridors tighter and add a secret vault",
    chips: ["Add a secret vault", "Add doors and lighting", "Make it more symmetrical"],
  },
];

/** Short text summary so the model can reason about the current map. */
function summarise(doc: Doc): string {
  const g = doc.settings.gridSize;
  const rooms = doc.shapes
    .filter((s) => !s.erase && (s.kind === "rect" || s.kind === "ellipse"))
    .slice(0, 24)
    .map((s) =>
      s.kind === "rect" || s.kind === "ellipse"
        ? `${s.kind} at ${Math.round(s.a.x / g)},${Math.round(s.a.y / g)} size ${Math.round(Math.abs(s.b.x - s.a.x) / g)}x${Math.round(
            Math.abs(s.b.y - s.a.y) / g,
          )}`
        : "",
    );
  const objs = doc.objects
    .slice(0, 30)
    .map((o) => `${o.kind}${"name" in o && o.name ? `(${o.name})` : ""}@${Math.round(o.x / g)},${Math.round(o.y / g)}`);
  return [
    `${doc.shapes.length} shapes, ${doc.objects.length} objects, ${doc.layers.length} layers, ${doc.fog.length} fogged cells`,
    rooms.length ? `rooms: ${rooms.join("; ")}` : "",
    objs.length ? `objects: ${objs.join(", ")}` : "",
    `style: grid ${doc.settings.gridStyle}, hatch ${doc.settings.hatch}, roughness ${doc.settings.roughness}, walls ${doc.settings.wallThickness}`,
  ]
    .filter(Boolean)
    .join(". ")
    .slice(0, 5000);
}

type Turn = { role: "user" | "assistant"; content: string };

type Props = {
  doc: Doc;
  /** Stage the suggestion on the canvas as a ghost preview (null clears it). */
  onPreview: (s: AiSuggestion | null) => void;
  /** Commit the staged suggestion to the document. */
  onApply: (s: AiSuggestion) => void;
  /** Suggestion currently staged on the canvas, if any. */
  staged: AiSuggestion | null;
};

export function AiPanel({ doc, onPreview, onApply, staged }: Props) {
  const run = useServerFn(suggestMap);
  const online = useOnlineStatus();
  const [mode, setMode] = useState<Mode>("rooms");
  const [engine, setEngine] = useState<AiEngine>("balanced");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AiSuggestion | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);

  const hasGeometry = (s: AiSuggestion) =>
    s.rooms.length > 0 || s.corridors.length > 0 || s.objects.length > 0 || Object.keys(s.settings).length > 0;

  const ask = async (text?: string) => {
    const q = (text ?? prompt).trim();
    if (!q) return;
    if (!online) {
      toast.error("You are offline — the AI cartographer needs a connection.");
      return;
    }
    setBusy(true);
    setResult(null);
    onPreview(null);
    try {
      const res = await run({
        data: {
          prompt: q,
          summary: summarise(doc),
          mode,
          engine,
          gridSize: doc.settings.gridSize,
          history: history.slice(-6),
        },
      });
      setResult(res);
      if (hasGeometry(res)) {
        onPreview(res);
        toast.info("Preview staged — accept or reject it on the canvas.");
      }
      setHistory((h) => [...h.slice(-4), { role: "user", content: q }, { role: "assistant", content: res.notes || "(layout returned)" }]);
      setPrompt("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      toast.error(
        msg.includes("402")
          ? "AI credits exhausted — add credits to keep generating."
          : msg.includes("429")
            ? "Too many AI requests, try again shortly."
            : msg,
      );
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

      <div className="flex flex-wrap gap-1">
        {active.chips.map((c) => (
          <button
            key={c}
            type="button"
            disabled={busy}
            onClick={() => setPrompt(c)}
            className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
          >
            {c}
          </button>
        ))}
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void ask();
        }}
        placeholder={active.placeholder}
        rows={3}
        className="text-[11px]"
      />
      <Button size="sm" className="h-7 w-full text-[11px]" disabled={busy || !prompt.trim()} onClick={() => void ask()}>
        {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : !online ? <WifiOff className="mr-1 h-3 w-3" /> : <Sparkles className="mr-1 h-3 w-3" />}
        {busy ? "Thinking…" : online ? "Ask the AI  (⌘⏎)" : "Offline"}
      </Button>

      {history.length > 0 && (
        <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-border/50 bg-background/40 p-2">
          {history.map((t, i) => (
            <p key={i} className={`text-[10px] leading-relaxed ${t.role === "user" ? "text-foreground/80" : "text-muted-foreground"}`}>
              <span className="font-semibold uppercase tracking-wide">{t.role === "user" ? "you" : "ai"}: </span>
              {t.content}
            </p>
          ))}
        </div>
      )}

      {result && (
        <div className="space-y-2 rounded-md border border-border/60 bg-card/60 p-2">
          {result.notes && <p className="text-[11px] leading-relaxed text-muted-foreground">{result.notes}</p>}
          <div className="flex flex-wrap gap-1">
            {result.rooms.length > 0 && <Badge variant="secondary" className="text-[9px]">{result.rooms.length} rooms</Badge>}
            {result.corridors.length > 0 && <Badge variant="secondary" className="text-[9px]">{result.corridors.length} corridors</Badge>}
            {result.objects.length > 0 && <Badge variant="secondary" className="text-[9px]">{result.objects.length} objects</Badge>}
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
          {(result.rooms.length > 0 ||
            result.corridors.length > 0 ||
            result.objects.length > 0 ||
            Object.keys(result.settings).length > 0) && (
            <Button
              size="sm"
              variant="secondary"
              className="h-6 w-full text-[10px]"
              onClick={() => {
                onApply(result);
                toast.success("Applied to the map");
              }}
            >
              Apply to map
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
