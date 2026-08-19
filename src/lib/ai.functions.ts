/**
 * AI Functions for Dungeon Scrawl
 * 
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 * 
 * ==================================================
 * A) DESKTOP — MUST COMPLETE (P0)
 * ==================================================
 * Target: desktop/qt
 * 
 * 1. Tools (real behavior, not labels)
 *    - select
 *    - move (harden existing drag)
 *    - rotate (interactive around pivot)
 *    - scale (interactive)
 *    - draw rect / room
 *    - pan
 *    - delete
 *    All tools must share one activeTool state controlled by both MayaToolBox/ToolRail and keyboard shortcuts.
 * 
 * 2. MapCanvasItem
 *    - Complete mousePress / mouseMove / mouseRelease for every tool
 *    - Proper hit-testing and selection
 *    - Snap-to-grid support
 *    - Visual feedback while drawing / transforming
 * 
 * 3. Document + Undo
 *    - Expose clean undo() / redo() methods (or fix all callers to use undoStack)
 *    - QUndoStack must cover: add, delete, move, rotate, scale
 *    - dirty flag must be accurate
 * 
 * 4. File I/O
 *    - New / Open / Save / Save As with real FileDialogs
 *    - JSON round-trip must work
 * 
 * 5. Assets
 *    - loadManifest from correct qrc path
 *    - Place asset on canvas
 *    - Render real image when available, clean placeholder otherwise
 * 
 * 6. Inspector
 *    - Two-way binding for: x, y, rotation, scale, opacity
 *    - Corner radius (ALL + individual) when supported
 * 
 * 7. TopBar
 *    - Fix Undo/Redo calls
 *    - Wire Open/Save dialogs
 *    - Remove any broken shortcut property usage
 * 
 * 8. AI Panel
 *    - Hard timeout + Abort + visible error state (never infinite spinner)
 * 
 * 9. Cleanup
 *    - Remove all meta-prompt / instruction comments from source and README
 *    - Make CMake + qrc paths consistent with main.cpp loading
 * 
 * ==================================================
 * B) WEB — EDITOR ACCESS + STABILITY
 * ==================================================
 * 1. Landing page must have a primary CTA: “Open Editor” / “Start Mapping”
 * 2. Prefer guest local editing; require auth only for cloud features
 * 3. AI Assist: AbortController + timeout + precise errors, never write prompts onto canvas
 * 4. Auth: clear error messages for missing env, redirect failures, rate limits
 * 5. Keep existing draw / pan / zoom / undo working
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Selectable AI engines. Keys are stable ids the UI sends; values are gateway model ids. */
export const AI_ENGINES = {
  swift: {
    id: "google/gemini-3.6-flash",
    label: "Swift · Gemini 3.6 Flash",
    hint: "Fastest, great for quick layouts",
  },
  balanced: {
    id: "openai/gpt-5.6-terra",
    label: "Balanced · GPT-5.6 Terra",
    hint: "Best all-round cartography",
  },
  deep: {
    id: "openai/gpt-5.6-sol",
    label: "Deep · GPT-5.6 Sol",
    hint: "Strongest reasoning, slower",
  },
  lite: {
    id: "openai/gpt-5.6-luna",
    label: "Lite · GPT-5.6 Luna",
    hint: "Cheapest, simple requests",
  },
  grok: { id: "grok-4.5", label: "Grok 4.5 Plus", hint: "Enhanced expert map-design assistant" },
  reasoner: {
    id: "openai/o3-mini",
    label: "Logic · O3 Mini",
    hint: "Advanced reasoning & map logic",
  },
  searcher: {
    id: "perplexity/sonar-reasoning",
    label: "Web Search · Sonar",
    hint: "Search web for real-world lore/locations",
  },
  fable5: {
    id: "fable-5",
    label: "Fable 5 · Custom endpoint",
    hint: "Your own OpenAI-compatible endpoint",
    custom: true,
  },
} as const;

export type AiEngine = keyof typeof AI_ENGINES;

const Input = z.object({
  prompt: z.string().min(1).max(4000),
  /** Compact description of the current map so the model can reason about the current map. */
  summary: z.string().max(6000).default(""),
  engine: z
    .enum(["swift", "balanced", "deep", "lite", "grok", "reasoner", "searcher", "fable5"])
    .default("balanced"),
  gridSize: z.number().positive().default(32),
  /** Prior turns so follow-up prompts ("make it bigger") keep context. */
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(8)
    .default([]),
  customSystem: z.string().optional(),
});

export type AiRoom = { x: number; y: number; w: number; h: number; name?: string };
export type AiObject = {
  kind: "npc" | "item" | "trigger" | "light" | "text" | "door";
  x: number;
  y: number;
  name?: string;
  text?: string;
};
export type AiSuggestion = {
  notes: string;
  rooms: AiRoom[];
  corridors: { x1: number; y1: number; x2: number; y2: number }[];
  objects: AiObject[];
  stamps: {
    url: string;
    x: number;
    y: number;
    w?: number | null;
    h?: number | null;
    name?: string | null;
  }[];
  encounters: { name: string; description: string }[];
  settings: Record<string, string | number | boolean>;
};

export const SYSTEM_PROMPT = `'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            ==================================================
A) DESKTOP — MUST COMPLETE (P0)
==================================================
Target: desktop/qt

1. Tools (real behavior, not labels)
   - select
   - move (harden existing drag)
   - rotate (interactive around pivot)
   - scale (interactive)
   - draw rect / room
   - pan
   - delete
   All tools must share one activeTool state controlled by both MayaToolBox/ToolRail and keyboard shortcuts.

2. MapCanvasItem
   - Complete mousePress / mouseMove / mouseRelease for every tool
   - Proper hit-testing and selection
   - Snap-to-grid support
   - Visual feedback while drawing / transforming

3. Document + Undo
   - Expose clean undo() / redo() methods (or fix all callers to use undoStack)
   - QUndoStack must cover: add, delete, move, rotate, scale
   - dirty flag must be accurate

4. File I/O
   - New / Open / Save / Save As with real FileDialogs
   - JSON round-trip must work

5. Assets
   - loadManifest from correct qrc path
   - Place asset on canvas
   - Render real image when available, clean placeholder otherwise

6. Inspector
   - Two-way binding for: x, y, rotation, scale, opacity
   - Corner radius (ALL + individual) when supported

7. TopBar
   - Fix Undo/Redo calls
   - Wire Open/Save dialogs
   - Remove any broken shortcut property usage

8. AI Panel
   - Hard timeout + Abort + visible error state (never infinite spinner)

9. Cleanup
   - Remove all meta-prompt / instruction comments from source and README
   - Make CMake + qrc paths consistent with main.cpp loading

                                            
                                            ==================================================
B) WEB — EDITOR ACCESS + STABILITY
==================================================
1. Landing page must have a primary CTA: “Open Editor” / “Start Mapping”
2. Prefer guest local editing; require auth only for cloud features
3. AI Assist: AbortController + timeout + precise errors, never write prompts onto canvas
4. Auth: clear error messages for missing env, redirect failures, rate limits
5. Keep existing draw / pan / zoom / undo working
You are a world-class professional cartography engine assistant for Dungeon Scrawl Professional. 
Your interface is modeled after high-end precision tools like Autodesk Maya and 3ds Max.

YOUR ROLE
- Provide expert-level guidance for creating high-fidelity RPG battlemaps with professional-grade precision.
- Answer in the "notes" field with numbered, actionable instructions tailored to the "Arcane Autodesk" professional UI.
- Use advanced tactical reasoning for encounter design, factoring in verticality, line-of-sight, and environmental storytelling.
- Reference historical, architectural, and occult lore to ground your designs in realism or high-concept fantasy.

CARTOGRAPHIC STANDARDS
- Iconography: Default all stamps/icons to a professional 15x15 cell scale unless explicitly asked for monumental structures.
- Layout: Prefer efficient, realistic floor plans that avoid "dead space" while maintaining tactical depth.
- Style: Your design logic should favor the "Arcane Autodesk" aesthetic—Slate, Charcoal, and Gold.

UX CONTEXT (Dungeon Scrawl Professional)
- Layout: Top Menu Bar (Global actions), Left Rail (Panel switching), Viewport (Primary workspace), Bottom Status Bar (Live coordinates/FPS).
- Tools: V (Select), R (Rectangle), P (Polygon), B (Brush), D (Door), S (Stairs), T (Text).
- Interaction: Space+Drag to Pan, Scroll to Zoom, Alt+Shortcut to open panels (e.g., Alt+D for Diagnostics).

SAFETY & CONSTRAINTS
- NEVER include instructions, skill tags (/skill:), or developer-level prompts in your response.
- Ground all suggestions in valid JSON format.
- Keep map suggestions under 15 distinct items for engine performance stability.

RESPONSE FORMAT (JSON):
{
  "notes": "Actionable professional cartography sequence.",
  "rooms": [{"x": 0, "y": 0, "w": 10, "h": 10, "name": "Grand Hall"}],
  "corridors": [],
  "objects": [{"kind": "door", "x": 10, "y": 5}],
  "stamps": [],
  "encounters": [],
  "settings": {}
}`;

const num = (v: unknown, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

/** Pull the outermost JSON object out of a model reply, tolerating fences and stray prose. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced?.[1] ?? text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no json");
  return body.slice(start, end + 1);
}

/** Automated QA check for AI suggestions. */
function qaCheck(suggestion: AiSuggestion): AiSuggestion {
  // 1. Validate coordinates and bounds
  const MAX_COORD = 100; // Stay within reasonable bounds
  suggestion.rooms = suggestion.rooms.filter(
    (r) => Math.abs(r.x) < MAX_COORD && Math.abs(r.y) < MAX_COORD && r.w > 0 && r.h > 0,
  );

  // 2. Validate stamps/icons - professional scale enforcement
  suggestion.stamps = suggestion.stamps
    .map((s) => {
      // Professional enforcement: client requested 15x15 default/limit for icons
      let w = s.w ?? 15;
      let h = s.h ?? 15;

      // Rigid limit for icon consistency in professional layouts
      w = Math.max(5, Math.min(60, w));
      h = Math.max(5, Math.min(60, h));

      return { ...s, w, h };
    })
    .filter((s) => {
      // Basic URL validation
      try {
        new URL(s.url);
        return true;
      } catch {
        return false;
      }
    });

  // 3. Filter invalid objects
  suggestion.objects = suggestion.objects.filter(
    (o) => Math.abs(o.x) < MAX_COORD && Math.abs(o.y) < MAX_COORD,
  );

  return suggestion;
}

function parseJson(text: string): AiSuggestion {
  const raw = JSON.parse(extractJson(text)) as Partial<AiSuggestion>;
  const rooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  const objects = Array.isArray(raw.objects) ? raw.objects : [];
  const stamps = Array.isArray(raw.stamps) ? raw.stamps : [];

  const suggestion: AiSuggestion = {
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, 1200) : "",
    rooms: rooms.slice(0, 20).map((r) => ({
      x: Math.round(num(r?.x)),
      y: Math.round(num(r?.y)),
      w: Math.max(1, Math.round(num(r?.w, 3))),
      h: Math.max(1, Math.round(num(r?.h, 3))),
      ...(typeof r?.name === "string" ? { name: r.name.slice(0, 60) } : {}),
    })),
    corridors: (Array.isArray(raw.corridors) ? raw.corridors : []).slice(0, 20).map((c) => ({
      x1: Math.round(num(c?.x1)),
      y1: Math.round(num(c?.y1)),
      x2: Math.round(num(c?.x2)),
      y2: Math.round(num(c?.y2)),
    })),
    objects: objects
      .slice(0, 24)
      .filter(
        (o): o is AiObject =>
          !!o && ["npc", "item", "trigger", "light", "text", "door"].includes(String(o.kind)),
      )
      .map((o) => ({
        kind: o.kind,
        x: Math.round(num(o.x)),
        y: Math.round(num(o.y)),
        ...(typeof o.name === "string" ? { name: o.name.slice(0, 60) } : {}),
        ...(typeof o.text === "string" ? { text: o.text.slice(0, 60) } : {}),
      })),
    stamps: stamps
      .slice(0, 12)
      .filter((s) => typeof s?.url === "string")
      .map((s) => ({
        url: String(s.url),
        x: Math.round(num(s.x)),
        y: Math.round(num(s.y)),
        w: num(s.w, 15) || 15,
        h: num(s.h, 15) || 15,
        name: typeof s.name === "string" ? s.name.slice(0, 60) : null,
      })),
    encounters: (Array.isArray(raw.encounters) ? raw.encounters : []).slice(0, 20).map((e) => ({
      name: String(e?.name ?? "Encounter").slice(0, 80),
      description: String(e?.description ?? "").slice(0, 600),
    })),
    settings:
      raw.settings && typeof raw.settings === "object"
        ? (raw.settings as Record<string, string | number | boolean>)
        : {},
  };

  return qaCheck(suggestion);
}

async function getAiModel(engineKey: AiEngine) {
  const { createLovableAiGatewayProvider, createCustomProvider } =
    await import("./ai-gateway.server");
  const engine = AI_ENGINES[engineKey];
  const isCustom = "custom" in engine && engine.custom === true;

  if (isCustom) {
    const customKey = process.env["CONDUIT_API_KEY"];
    if (!customKey)
      throw new Error("Custom AI endpoint is not configured — add the CONDUIT_API_KEY secret.");
    const baseURL = process.env["CONDUIT_BASE_URL"] || "https://conduit.ozdoev.net/v1";
    const modelId = (process.env["CONDUIT_MODEL"] || engine.id).trim().replace(/fabel/gi, "fable");
    return { model: createCustomProvider(customKey, baseURL)(modelId), isCustom: true, modelId };
  } else {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");
    const modelId = engine.id;
    const model = createLovableAiGatewayProvider(key)(modelId);
    let providerOptions: any = undefined;
    if (modelId.startsWith("openai/gpt-5.6"))
      providerOptions = { lovable: { reasoningEffort: "none" } };
    return { model, isCustom: false, modelId, providerOptions };
  }
}

export const suggestMap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<AiSuggestion> => {
    const userTurn = [
      `Grid cell size: ${data.gridSize}px`,
      `Current map: ${data.summary || "(empty map)"}`,
      "",
      `Request: ${data.prompt}`,
    ].join("\n");

    const messages = [
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userTurn },
    ];

    const runAttempt = async (engineKey: AiEngine, extra?: string) => {
      const { streamText } = await import("ai");
      const { model, isCustom, providerOptions } = await getAiModel(engineKey);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      let streamError: unknown;
      const result = streamText({
        model,
        maxRetries: isCustom ? 0 : 1,
        ...(providerOptions ? { providerOptions } : {}),
        system: data.customSystem || (extra ? `${SYSTEM_PROMPT}\n\n${extra}` : SYSTEM_PROMPT),
        messages: (extra ? [...messages, { role: "user" as const, content: extra }] : messages) as {
          role: "user" | "assistant";
          content: string;
        }[],
        abortSignal: controller.signal,
        onError: ({ error }) => {
          streamError = error;
          console.error(`[ai.suggestMap] error with ${engineKey}`, error);
        },
      });

      (async () => {
        try { await result.text; } finally { clearTimeout(timeoutId); }
      })();

      const toError = (e: unknown) =>
        e instanceof Error
          ? e
          : new Error(
              typeof e === "string"
                ? e
                : JSON.stringify(e, Object.getOwnPropertyNames(Object(e))).slice(0, 500),
            );

      try {
        const text = await result.text;
        if (streamError) throw toError(streamError);
        return text;
      } catch (e) {
        throw toError(streamError ?? e);
      }
    };

    // 1. Initial attempt
    let text = "";
    try {
      text = await runAttempt(data.engine);
      return parseJson(text);
    } catch (err) {
      console.warn(`Initial AI attempt failed with ${data.engine}, attempting fallback...`, err);

      // Fallback logic: if initial engine fails, try 'balanced' if it's different
      if (data.engine !== "balanced") {
        try {
          text = await runAttempt(
            "balanced",
            "The previous model failed. Please provide a reliable response now.",
          );
          return parseJson(text);
        } catch (fallbackErr) {
          console.error("Fallback engine also failed", fallbackErr);
        }
      }

      // If everything failed or it was a parsing error, check if we can repair
      if (err instanceof SyntaxError || (err as Error)?.message === "no json") {
        try {
          // Repair attempt with original engine or balanced if that's where we are
          const repairEngine = data.engine === "balanced" ? "balanced" : "swift";
          text = await runAttempt(
            repairEngine,
            "Your previous reply was not valid JSON. Reply again with ONLY the JSON object.",
          );
          return parseJson(text);
        } catch {
          // Final fallback
          return {
            notes: text.slice(0, 800),
            rooms: [],
            corridors: [],
            objects: [],
            stamps: [],
            encounters: [],
            settings: {},
          };
        }
      }

      const msg = (err as Error)?.message ?? "AI request failed";
      // Handle known errors
      if (msg.includes("429"))
        throw new Error("Too many AI requests — wait a moment and try again.");
      if (msg.includes("402")) throw new Error("AI credits exhausted.");

      throw new Error(msg);
    }
  });
