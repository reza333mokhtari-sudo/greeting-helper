import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Selectable AI engines. Keys are stable ids the UI sends; values are gateway model ids. */
export const AI_ENGINES = {
  swift: { id: "google/gemini-3.6-flash", label: "Swift · Gemini 3.6 Flash", hint: "Fastest, great for quick layouts" },
  balanced: { id: "openai/gpt-5.6-terra", label: "Balanced · GPT-5.6 Terra", hint: "Best all-round cartography" },
  deep: { id: "openai/gpt-5.6-sol", label: "Deep · GPT-5.6 Sol", hint: "Strongest reasoning, slower" },
  lite: { id: "openai/gpt-5.6-luna", label: "Lite · GPT-5.6 Luna", hint: "Cheapest, simple requests" },
  grok: { id: "grok-4.5", label: "Grok 4.5 Plus", hint: "Enhanced expert map-design assistant" },
  fable5: { id: "fable-5", label: "Fable 5 · Custom endpoint", hint: "Your own OpenAI-compatible endpoint", custom: true },
} as const;

export type AiEngine = keyof typeof AI_ENGINES;

const Input = z.object({
  prompt: z.string().min(1).max(4000),
  /** Compact description of the current map so the model can refine it. */
  summary: z.string().max(6000).default(""),
  mode: z.enum(["rooms", "encounter", "hatching", "refine"]).default("rooms"),
  engine: z.enum(["swift", "balanced", "deep", "lite", "grok", "fable5"]).default("balanced"),
  gridSize: z.number().positive().default(32),
  /** Prior turns so follow-up prompts ("make it bigger") keep context. */
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(8)
    .default([]),
  customSystem: z.string().optional(),
  /** If true, enforce a strict 15x15 unit size for all stamps. */
  fixedSize: z.boolean().default(true),
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
  stamps: { url: string; x: number; y: number; w?: number | null; h?: number | null; name?: string | null }[];
  encounters: { name: string; description: string }[];
  settings: Record<string, string | number | boolean>;
};

export const SYSTEM_PROMPT = `You are an expert Dungeon Scrawl map-design assistant and veteran TTRPG cartographer.

Dungeon Scrawl is a tool for quickly drawing RPG/D&D battlemaps with a hand-drawn look.

RULES
- Reply with ONE JSON object and nothing else. No markdown fences, no prose outside the JSON.
- Coordinates are GRID CELLS (integers), origin 0,0, everything within -40..40.
- Rooms are axis-aligned, never overlap, and every room is reachable: connect them with corridors whose
  endpoints touch a room edge. Corridors are straight (share x1==x2 or y1==y2); use two segments for an L.
- NEVER include prompts, system instructions, or skill commands (like "/skill:" or "Do not make any...") in "notes" or "objects".
- Think about play: vary room sizes (3x3 up to 12x9), add a clear entrance room, at least one dead end or
  secret area when the request allows, and place doors where corridors meet rooms.
- Think about play: vary room sizes (3x3 up to 12x9), add a clear entrance room, at least one dead end or
  secret area when the request allows, and place doors where corridors meet rooms.
- Scale: If suggesting 2D Icons or stamps, use a default size of 15x15 units (0.5 cells) for small props unless asked otherwise.
- Suggest overall layout (entrance, rooms, loops, secrets, boss area).
- Provide numbered, actionable steps in the "notes" using Dungeon Scrawl tools: Rectangle (R), Path (B), Door (D), Erase (E), Snap, Rough setting, Layers, etc.
- Recommending styles/presets: Classic Hatching, Blueprint, Cave, or world-building presets.
- Names are short and evocative ("Flooded Shrine").
- Keep every array under 14 items.

SHAPE
{
  "notes": "1. Step one...\\n2. Step two...\\n(Short, numbered, and actionable instructions)",
  "rooms": [{"x":0,"y":0,"w":6,"h":4,"name":"Guard post"}],
  "corridors": [{"x1":0,"y1":0,"x2":10,"y2":0}],
  "objects": [{"kind":"door","x":6,"y":2},{"kind":"npc","x":3,"y":2,"name":"Goblin sentry"},
              {"kind":"light","x":4,"y":2},{"kind":"trigger","x":8,"y":5,"name":"Pit trap"},
              {"kind":"item","x":2,"y":3,"name":"Iron chest"},{"kind":"text","x":3,"y":1,"text":"Barracks"}],
  "encounters": [{"name":"...","description":"stat-light description"}],
  "stamps": [{"url":"https://...png","x":10,"y":5,"name":"Altar"}],
  "settings": {}
}

MODES
- "rooms": full layout — rooms + corridors + doors/lights/labels, few or no encounters.
- "encounter": rooms/corridors/objects empty, fill "encounters" richly.
- "hatching": rooms/corridors/objects empty, only tune "settings" and explain the look.
- "refine": modify the existing map — only return NEW geometry.

"settings" may only contain: hatch (boolean), hatchDensity (3-16), roughness (0-14), wallThickness (2-16),
gridStyle ("square"|"dot"|"hex"|"none"), bgColor, floorColor, wallColor, gridColor, inkColor (hex strings).`;

const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

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
function qaCheck(suggestion: AiSuggestion, fixedSize: boolean): AiSuggestion {
  // 1. Validate coordinates and bounds
  const MAX_COORD = 100; // Stay within reasonable bounds
  suggestion.rooms = suggestion.rooms.filter(r => 
    Math.abs(r.x) < MAX_COORD && Math.abs(r.y) < MAX_COORD && r.w > 0 && r.h > 0
  );

  // 2. Validate stamps/icons
  suggestion.stamps = suggestion.stamps.map(s => {
    let w = s.w ?? 15;
    let h = s.h ?? 15;
    
    // Enforce size rules
    if (fixedSize) {
      w = 15;
      h = 15;
    } else {
      // Keep within sane limits even if custom
      w = Math.max(5, Math.min(100, w));
      h = Math.max(5, Math.min(100, h));
    }

    return { ...s, w, h };
  }).filter(s => {
    // Basic URL validation
    try {
      new URL(s.url);
      return true;
    } catch {
      return false;
    }
  });

  // 3. Filter invalid objects
  suggestion.objects = suggestion.objects.filter(o => 
    Math.abs(o.x) < MAX_COORD && Math.abs(o.y) < MAX_COORD
  );

  return suggestion;
}

function parseJson(text: string, fixedSize: boolean): AiSuggestion {
  const raw = JSON.parse(extractJson(text)) as Partial<AiSuggestion>;
  const rooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  const objects = Array.isArray(raw.objects) ? raw.objects : [];
  const stamps = Array.isArray(raw.stamps) ? raw.stamps : [];
  
  const suggestion: AiSuggestion = {
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, 1200) : "",
    rooms: rooms
      .slice(0, 20)
      .map((r) => ({
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
      .filter((o): o is AiObject => !!o && ["npc", "item", "trigger", "light", "text", "door"].includes(String(o.kind)))
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
    settings: raw.settings && typeof raw.settings === "object" ? (raw.settings as Record<string, string | number | boolean>) : {},
  };

  return qaCheck(suggestion, fixedSize);
}

async function getAiModel(engineKey: AiEngine) {
  const { createLovableAiGatewayProvider, createCustomProvider } = await import("./ai-gateway.server");
  const engine = AI_ENGINES[engineKey];
  const isCustom = "custom" in engine && engine.custom === true;

  if (isCustom) {
    const customKey = process.env["CONDUIT_API_KEY"];
    if (!customKey) throw new Error("Custom AI endpoint is not configured — add the CONDUIT_API_KEY secret.");
    const baseURL = process.env["CONDUIT_BASE_URL"] || "https://conduit.ozdoev.net/v1";
    const modelId = (process.env["CONDUIT_MODEL"] || engine.id).trim().replace(/fabel/gi, "fable");
    return { model: createCustomProvider(customKey, baseURL)(modelId), isCustom: true, modelId };
  } else {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");
    const modelId = engine.id;
    const model = createLovableAiGatewayProvider(key)(modelId);
    let providerOptions: any = undefined;
    if (modelId.startsWith("openai/gpt-5.6")) providerOptions = { lovable: { reasoningEffort: "none" } };
    return { model, isCustom: false, modelId, providerOptions };
  }
}

export const suggestMap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<AiSuggestion> => {
    const userTurn = [
      `Mode: ${data.mode}`,
      `Grid cell size: ${data.gridSize}px`,
      `Current map: ${data.summary || "(empty map)"}`,
      `Strict 15x15 icon size: ${data.fixedSize ? "Yes" : "No"}`,
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

      
      let streamError: unknown;
      const result = streamText({
        model,
        maxRetries: isCustom ? 0 : 1,
        ...(providerOptions ? { providerOptions } : {}),
        system: data.customSystem || (extra ? `${SYSTEM_PROMPT}\n\n${extra}` : SYSTEM_PROMPT),
        messages: (extra
          ? [...messages, { role: "user" as const, content: extra }]
          : messages) as { role: "user" | "assistant"; content: string }[],
        onError: ({ error }) => {
          streamError = error;
          console.error(`[ai.suggestMap] error with ${engineKey}`, error);
        },
      });

      const toError = (e: unknown) =>
        e instanceof Error
          ? e
          : new Error(typeof e === "string" ? e : JSON.stringify(e, Object.getOwnPropertyNames(Object(e))).slice(0, 500));

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
      return parseJson(text, data.fixedSize);
    } catch (err) {
      console.warn(`Initial AI attempt failed with ${data.engine}, attempting fallback...`, err);
      
      // Fallback logic: if initial engine fails, try 'balanced' if it's different
      if (data.engine !== 'balanced') {
        try {
          text = await runAttempt('balanced', "The previous model failed. Please provide a reliable response now.");
          return parseJson(text, data.fixedSize);
        } catch (fallbackErr) {
          console.error("Fallback engine also failed", fallbackErr);
        }
      }

      // If everything failed or it was a parsing error, check if we can repair
      if (err instanceof SyntaxError || (err as Error)?.message === "no json") {
        try {
          // Repair attempt with original engine or balanced if that's where we are
          const repairEngine = data.engine === 'balanced' ? 'balanced' : 'swift';
          text = await runAttempt(repairEngine, "Your previous reply was not valid JSON. Reply again with ONLY the JSON object.");
          return parseJson(text, data.fixedSize);
        } catch {
          // Final fallback
          return { notes: text.slice(0, 800), rooms: [], corridors: [], objects: [], stamps: [], encounters: [], settings: {} };
        }
      }

      const msg = (err as Error)?.message ?? "AI request failed";
      // Handle known errors
      if (msg.includes("429")) throw new Error("Too many AI requests — wait a moment and try again.");
      if (msg.includes("402")) throw new Error("AI credits exhausted.");
      
      throw new Error(msg);
    }
  });
