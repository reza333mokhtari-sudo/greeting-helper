import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, WifiOff, Cpu, Settings2, RotateCcw, Save, Maximize2, Minimize2, HelpCircle } from "lucide-react";
import { toast } from "sonner";

import { suggestMap, AI_ENGINES, SYSTEM_PROMPT, type AiSuggestion, type AiEngine } from "@/lib/ai.functions";
import type { Doc } from "@/lib/dungeon/model";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dialog } from "@/lib/dialog";

type Mode = "rooms" | "encounter" | "hatching" | "refine";


const MODES: { id: Mode; label: string; placeholder: string; chips: string[] }[] = [
  {
    id: "rooms",
    label: "Suggest rooms",
    placeholder: "e.g. A small crypt with 4 rooms and a secret vault",
    chips: ["Small 6-room crypt", "Dungeon for level 3 party", "Wizard tower ground floor"],
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
  /** Name of the floor the AI is allowed to edit. */
  floorName?: string;
  onOpenHelp?: (sectionId?: string) => void;
};

export function AiPanel({ doc, onPreview, onApply, staged, floorName, onOpenHelp }: Props) {

  const run = useServerFn(suggestMap);
  const online = useOnlineStatus();
  const [engine, setEngine] = useState<AiEngine>("balanced");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [customSystem, setCustomSystem] = useState(() => localStorage.getItem("ai-cartographer-system") || SYSTEM_PROMPT);
  const [result, setResult] = useState<AiSuggestion | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);

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
          engine,
          gridSize: doc.settings.gridSize,
          history: history.slice(-6),
          customSystem: customSystem !== SYSTEM_PROMPT ? customSystem : undefined,
        },
      });
      setResult(res);
      if (res.rooms.length > 0 || res.corridors.length > 0 || res.objects.length > 0) {
        onPreview(res);
        toast.info("Preview staged — accept or reject it on the canvas.");
      }
      setHistory((h) => [...h.slice(-4), { role: "user", content: q }, { role: "assistant", content: res.notes || "(layout returned)" }]);
      setPrompt("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      toast.error(msg);
    }
    setBusy(false);
  };

  const SUGGESTED_CHIPS = [
    "How do I zoom and pan?",
    "Show me the Room tool",
    "How do I place props?",
    "Suggest a small 4-room crypt layout",
    "Where is the eraser?",
  ];

  return (
    <section className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> AI Assistant
        </h2>
        <div className="flex gap-1">
          {onOpenHelp && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-accent"
              onClick={() => onOpenHelp("quick-start")}
              title="Help"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`size-6 ${showEditor ? "text-accent bg-accent/10" : "text-muted-foreground"}`}
            title="AI Settings"
            onClick={() => setShowEditor(!showEditor)}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-destructive"
              title="Clear Chat"
              onClick={() => setHistory([])}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {showEditor && (
        <div className="space-y-2 rounded-md border border-accent/30 bg-accent/5 p-2 animate-in fade-in slide-in-from-top-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent">System Instructions</p>
          <Textarea
            value={customSystem}
            onChange={(e) => setCustomSystem(e.target.value)}
            className="min-h-[120px] font-mono text-[9px] leading-tight"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setCustomSystem(SYSTEM_PROMPT)}>Reset</Button>
            <Button size="sm" className="h-6 text-[10px]" onClick={() => {
              localStorage.setItem("ai-cartographer-system", customSystem);
              toast.success("Settings saved");
            }}>Save</Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 pr-3">
        <div className="space-y-3 py-1">
          {history.length === 0 && (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground italic">
                Ask me how to use the editor, find props, or suggest a layout.
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTED_CHIPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setPrompt(c);
                      void ask(c);
                    }}
                    className="flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-foreground"
                  >
                    <Sparkles className="h-3 w-3 text-accent/60" />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((t, i) => (
            <div key={i} className={`flex flex-col gap-1 ${t.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[90%] rounded-lg px-2.5 py-2 text-[11px] leading-relaxed shadow-sm ${
                t.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/80 text-foreground border border-border/40"
              }`}>
                {t.content}
              </div>
            </div>
          ))}

          {result && (
            <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-2.5 animate-in fade-in zoom-in-95">
              {result.notes && <div className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap">{result.notes}</div>}
              
              {(result.rooms.length > 0 || result.corridors.length > 0 || result.objects.length > 0) && !staged && (
                <Button size="sm" variant="secondary" className="h-7 w-full gap-1.5 text-[10px]" onClick={() => onPreview(result)}>
                  <Maximize2 className="h-3 w-3" /> Preview suggestion on map
                </Button>
              )}

              {staged && (
                <div className="space-y-2 rounded-md border border-accent/40 bg-accent/5 p-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> Map Preview Active
                  </p>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 flex-1 text-[10px]"
                      onClick={() => {
                        onApply(result);
                        onPreview(null);
                        setResult(null);
                        toast.success("Applied to map");
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 flex-1 text-[10px]"
                      onClick={() => {
                        onPreview(null);
                        toast("Preview cleared");
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {busy && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="space-y-2 pt-2 border-t">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask();
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="min-h-[40px] resize-none pr-10 text-[11px] focus-visible:ring-accent/30"
          />
          <Button 
            size="icon" 
            className="absolute right-1.5 top-1.5 size-7 rounded-md" 
            disabled={busy || !prompt.trim() || !online} 
            onClick={() => void ask()}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <p className="text-center text-[9px] text-muted-foreground">
          {!online ? "You are offline" : "Press Enter to send"}
        </p>
      </div>
    </section>
  );
}
