import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Loader2, Maximize2, HelpCircle, Settings2, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";

import { AI_ENGINES, SYSTEM_PROMPT, type AiSuggestion, type AiEngine } from "@/lib/ai.functions";
import type { Doc } from "@/lib/dungeon/model";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

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

type Message = { id: string; role: 'user' | 'assistant'; content: string };

type Props = {
  doc: Doc;
  onPreview: (s: AiSuggestion | null) => void;
  onApply: (s: AiSuggestion) => void;
  staged: AiSuggestion | null;
  floorName?: string;
  onOpenHelp?: (sectionId?: string) => void;
};

export function AiPanel({ doc, onPreview, onApply, staged, floorName, onOpenHelp }: Props) {
  const online = useOnlineStatus();
  const [engine, setEngine] = useState<AiEngine>("balanced");
  const [showEditor, setShowEditor] = useState(false);
  const [customSystem, setCustomSystem] = useState(() => localStorage.getItem("ai-cartographer-system") || SYSTEM_PROMPT);
  const [result, setResult] = useState<AiSuggestion | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const ask = async (text: string) => {
    if (!online || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setResult(null);
    onPreview(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          summary: summarise(doc),
          engine,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantId = (Date.now() + 1).toString();
      let assistantContent = "";
      
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "" }]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
      }

      // Final processing for JSON layout
      try {
        const jsonMatch = assistantContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]) as AiSuggestion;
          setResult(parsed);
          onPreview(parsed);
        }
      } catch (e) {
        console.warn("No layout found in response");
      }

    } catch (err) {
      toast.error("AI Assistant is currently unavailable.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = inputValue.trim();
    if (q) {
      setInputValue("");
      ask(q);
    }
  };

  const SUGGESTED_CHIPS = [
    "Suggest a crypt based on historical catacombs",
    "How do I zoom and pan?",
    "Show me the Room tool",
    "How do I place props?",
    "Suggest a layout for a wizard tower",
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
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-destructive"
              title="Clear Chat"
              onClick={() => {
                setMessages([]);
                setResult(null);
                onPreview(null);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">AI Model</label>
        <select 
          value={engine} 
          onChange={(e) => setEngine(e.target.value as AiEngine)}
          className="w-full bg-background border border-border/50 rounded px-2 py-1 text-[11px] outline-none focus:border-accent/50"
        >
          {Object.entries(AI_ENGINES).map(([key, config]) => (
            <option key={key} value={key as AiEngine}>{config.label}</option>
          ))}
        </select>
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
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground italic">
                Ask me how to use the editor, find props, or suggest a layout.
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTED_CHIPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => ask(c)}
                    className="flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-foreground"
                  >
                    <Sparkles className="h-3 w-3 text-accent/60" />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[90%] rounded-lg px-2.5 py-2 text-[11px] leading-relaxed shadow-sm ${
                m.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/80 text-foreground border border-border/40"
              }`}>
                <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-pre:bg-black/20 prose-code:text-accent">
                  <ReactMarkdown>
                    {DOMPurify.sanitize(m.content)}
                  </ReactMarkdown>
                </div>
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
          
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={onSubmit} className="space-y-2 pt-2 border-t">
        <div className="relative">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="min-h-[40px] resize-none pr-10 text-[11px] focus-visible:ring-accent/30"
          />
          <Button 
            size="icon" 
            type="submit"
            className="absolute right-1.5 top-1.5 size-7 rounded-md" 
            disabled={isLoading || !inputValue.trim() || !online} 
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <p className="text-center text-[9px] text-muted-foreground">
          {!online ? "You are offline" : "Press Enter to send"}
        </p>
      </form>
    </section>
  );
}
