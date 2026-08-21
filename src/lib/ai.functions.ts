/**
 * AI Functions for Dungeon Scrawl
 * 
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *                                        
 *                                            
 *                                            Also mirror the same patterns into desktop/qt where applicable
 *
 * ## PROMPT بازنویسی‌شده (ضد گیر کردن + Tiled-first + Desktop mirror)
 *
 * این نسخه برای Lovable کوتاه‌تر از مقاله، ولی دقیق است؛ کار را **تکه‌تکه** می‌کند تا fail/hang ندهد.
 *
 * ```text
 * /developerMode
 *
 * SKILLS
 * - Map editor architect (Tiled patterns)
 * - React/TypeScript editor implementer
 * - Qt/QML pattern mirror for desktop/qt
 * - Debugger: small fixes, no rewrites
 * - UI/UX for dense DCC tools
 *
 * PRIMARY REFERENCE (patterns only, DO NOT copy code):
 * https://github.com/mapeditor/tiled
 *
 * SECONDARY REFERENCE (interaction/model ideas only):
 * https://github.com/mohsenD98/GraphFlow
 *
 * Also mirror the same patterns into desktop/qt where applicable.
 *
 * CRITICAL RULES (anti-fail)
 * 1) Do NOT rewrite the whole app.
 * 2) Do NOT migrate frameworks.
 * 3) Do NOT touch unrelated marketing pages except adding a clear Open Editor button.
 * 4) One vertical slice at a time. After each slice, keep app compiling/running.
 * 5) If a step is risky, implement the minimal safe version and continue.
 * 6) Never leave the AI spinner infinite.
 * 7) Never write prompt/command text onto the canvas.
 * 8) No secrets in repo.
 * 9) Prefer fix existing tools over inventing new systems.
 *
 * GOAL
 * Unstick the product and make the editor reliable using Tiled-style architecture.
 *
 * TILED PATTERN MAPPING (apply in THIS project)
 * - Document core = single map document (floors/layers/objects/settings)
 * - Tool router = one activeTool; toolbar only switches tool; canvas handles input
 * - Undo commands = add/delete/move/transform undoable
 * - Dock shell = tools left, canvas center, panels right, status bottom
 * - Properties = inspector two-way on selection
 * - Save format = JSON map document + dirty state
 *
 * ==================================================
 * DO THIS IN ORDER (STOP AND VERIFY EACH)
 * ==================================================
 *
 * SLICE 1 — Editor reachable
 * - Ensure user can open the real editor in ≤2 clicks from home
 * - Local editing must work without forced login
 * - Auth only for cloud/AI if needed
 * Verify: editor canvas visible and interactive
 *
 * SLICE 2 — Tool router hard-wire
 * - Single activeTool state shared by toolbar + shortcuts + canvas
 * - Tools required: select, drawRect, pan, delete (erase if already present)
 * - Clicking toolbar MUST change canvas behavior
 * Verify: each tool does a different thing
 *
 * SLICE 3 — Core canvas ops
 * - draw room by drag
 * - select + drag move
 * - pan + wheel zoom to cursor
 * - delete selected
 * - grid/snap if already in codebase
 * Verify: create, move, delete one room
 *
 * SLICE 4 — Undo/redo
 * - Ctrl+Z / Ctrl+Y for add/delete/move at minimum
 * Verify: undo restores previous state
 *
 * SLICE 5 — Inspector + Assets
 * - Inspector edits selected object live (x/y/rotation/opacity if available)
 * - Asset search filters list
 * - Place asset onto canvas
 * Verify: select object → inspector changes appear on canvas
 *
 * SLICE 6 — AI hang fix
 * - timeout + abort
 * - visible error text
 * - no infinite “responding”
 * - AI output never painted as map text unless user explicitly applies a map action
 * Verify: failed AI shows error and UI recovers
 *
 * SLICE 7 — Desktop mirror (desktop/qt, only where applicable)
 * Apply the SAME patterns, minimal safe parity:
 * - activeTool shared concept
 * - draw/select/move/pan/zoom/delete
 * - document dirty + save/load JSON if FileService exists
 * - inspector binding if panel exists
 * - do not break CMake/qrc boot
 * Verify: desktop still builds conceptually; no empty critical stubs left in touched files
 *
 * ==================================================
 * UI RULES
 * ==================================================
 * - Dense dark Tiled-like editor chrome
 * - Active tool clearly highlighted
 * - Status bar shows tool + zoom if possible
 * - No dead buttons in the editor chrome
 * - Side panels scroll independently from canvas zoom
 *
 * ==================================================
 * DEBUG IF STUCK
 * ==================================================
 * If something fails:
 * 1) Identify owner: Document / Tool / Canvas / Panel / Auth / AI
 * 2) Patch only that owner
 * 3) Re-verify previous slices still pass
 * 4) Continue to next slice
 *
 * Do not cascade refactors.
 *
 * ==================================================
 * ACCEPTANCE (must report)
 * ==================================================
 * WEB
 * [ ] Editor opens quickly
 * [ ] Draw works
 * [ ] Select/move works
 * [ ] Pan/zoom works
 * [ ] Delete works
 * [ ] Undo works
 * [ ] Tools stay in sync
 * [ ] Asset place works (or explicitly partial)
 * [ ] AI cannot hang forever
 * [ ] No prompt text on canvas
 *
 * DESKTOP (mirrored where applicable)
 * [ ] Same tool patterns present in desktop/qt
 * [ ] No boot path broken
 * [ ] Touched files are not empty stubs
 *
 * OUTPUT FORMAT
 * 1) Slice-by-slice what changed
 * 2) Files touched (web and desktop/qt)
 * 3) Checklist pass/fail
 * 4) Anything still partial (honest)
 * ```
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
                                        
                                            
                                            Also mirror the same patterns into desktop/qt where applicable

## PROMPT بازنویسی‌شده (ضد گیر کردن + Tiled-first + Desktop mirror)

این نسخه برای Lovable کوتاه‌تر از مقاله، ولی دقیق است؛ کار را **تکه‌تکه** می‌کند تا fail/hang ندهد.

/developerMode

SKILLS
- Map editor architect (Tiled patterns)
- React/TypeScript editor implementer
- Qt/QML pattern mirror for desktop/qt
- Debugger: small fixes, no rewrites
- UI/UX for dense DCC tools

PRIMARY REFERENCE (patterns only, DO NOT copy code):
https://github.com/mapeditor/tiled

SECONDARY REFERENCE (interaction/model ideas only):
https://github.com/mohsenD98/GraphFlow

Also mirror the same patterns into desktop/qt where applicable.

CRITICAL RULES (anti-fail)
1) Do NOT rewrite the whole app.
2) Do NOT migrate frameworks.
3) Do NOT touch unrelated marketing pages except adding a clear Open Editor button.
4) One vertical slice at a time. After each slice, keep app compiling/running.
5) If a step is risky, implement the minimal safe version and continue.
6) Never leave the AI spinner infinite.
7) Never write prompt/command text onto the canvas.
8) No secrets in repo.
9) Prefer fix existing tools over inventing new systems.

GOAL
Unstick the product and make the editor reliable using Tiled-style architecture.

TILED PATTERN MAPPING (apply in THIS project)
- Document core = single map document (floors/layers/objects/settings)
- Tool router = one activeTool; toolbar only switches tool; canvas handles input
- Undo commands = add/delete/move/transform undoable
- Dock shell = tools left, canvas center, panels right, status bottom
- Properties = inspector two-way on selection
- Save format = JSON map document + dirty state

==================================================
DO THIS IN ORDER (STOP AND VERIFY EACH)
==================================================

SLICE 1 — Editor reachable
- Ensure user can open the real editor in ≤2 clicks from home
- Local editing must work without forced login
- Auth only for cloud/AI if needed
Verify: editor canvas visible and interactive

SLICE 2 — Tool router hard-wire
- Single activeTool state shared by toolbar + shortcuts + canvas
- Tools required: select, drawRect, pan, delete (erase if already present)
- Clicking toolbar MUST change canvas behavior
Verify: each tool does a different thing

SLICE 3 — Core canvas ops
- draw room by drag
- select + drag move
- pan + wheel zoom to cursor
- delete selected
- grid/snap if already in codebase
Verify: create, move, delete one room

SLICE 4 — Undo/redo
- Ctrl+Z / Ctrl+Y for add/delete/move at minimum
Verify: undo restores previous state

SLICE 5 — Inspector + Assets
- Inspector edits selected object live (x/y/rotation/opacity if available)
- Asset search filters list
- Place asset onto canvas
Verify: select object → inspector changes appear on canvas

SLICE 6 — AI hang fix
- timeout + abort
- visible error text
- no infinite “responding”
- AI output never painted as map text unless user explicitly applies a map action
Verify: failed AI shows error and UI recovers

SLICE 7 — Desktop mirror (desktop/qt, only where applicable)
Apply the SAME patterns, minimal safe parity:
- activeTool shared concept
- draw/select/move/pan/zoom/delete
- document dirty + save/load JSON if FileService exists
- inspector binding if panel exists
- do not break CMake/qrc boot
Verify: desktop still builds conceptually; no empty critical stubs left in touched files

==================================================
UI RULES
==================================================
- Dense dark Tiled-like editor chrome
- Active tool clearly highlighted
- Status bar shows tool + zoom if possible
- No dead buttons in the editor chrome
- Side panels scroll independently from canvas zoom

==================================================
DEBUG IF STUCK
==================================================
If something fails:
1) Identify owner: Document / Tool / Canvas / Panel / Auth / AI
2) Patch only that owner
3) Re-verify previous slices still pass
4) Continue to next slice

Do not cascade refactors.

==================================================
ACCEPTANCE (must report)
==================================================
WEB
[ ] Editor opens quickly
[ ] Draw works
[ ] Select/move works
[ ] Pan/zoom works
[ ] Delete works
[ ] Undo works
[ ] Tools stay in sync
[ ] Asset place works (or explicitly partial)
[ ] AI cannot hang forever
[ ] No prompt text on canvas

DESKTOP (mirrored where applicable)
[ ] Same tool patterns present in desktop/qt
[ ] No boot path broken
[ ] Touched files are not empty stubs

OUTPUT FORMAT
1) Slice-by-slice what changed
2) Files touched (web and desktop/qt)
3) Checklist pass/fail
4) Anything still partial (honest)
```

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