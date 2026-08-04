import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

/** Selectable AI engines. Keys are stable ids the UI sends; values are gateway model ids. */
export const AI_ENGINES = {
  swift: { id: "google/gemini-3.6-flash", label: "Swift · Gemini 3.6 Flash", hint: "Fastest, great for quick layouts" },
  balanced: { id: "openai/gpt-5.6-terra", label: "Balanced · GPT-5.6 Terra", hint: "Best all-round cartography" },
  deep: { id: "openai/gpt-5.6-sol", label: "Deep · GPT-5.6 Sol", hint: "Strongest reasoning, slower" },
  lite: { id: "openai/gpt-5.6-luna", label: "Lite · GPT-5.6 Luna", hint: "Cheapest, simple requests" },
  fable5: { id: "fable-5", label: "Fable 5 · Custom endpoint", hint: "Your own OpenAI-compatible endpoint", custom: true },
} as const;

export type AiEngine = keyof typeof AI_ENGINES;

const Input = z.object({
  prompt: z.string().min(1).max(4000),
  /** Compact description of the current map so the model can refine it. */
  summary: z.string().max(6000).default(""),
  mode: z.enum(["rooms", "encounter", "hatching", "refine"]).default("rooms"),
  engine: z.enum(["swift", "balanced", "deep", "lite", "fable5"]).default("balanced"),
  gridSize: z.number().positive().default(32),
  /** Prior turns so follow-up prompts ("make it bigger") keep context. */
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(8)
    .default([]),
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
  encounters: { name: string; description: string }[];
  settings: Record<string, string | number | boolean>;
};

const SYSTEM = `You are a veteran TTRPG cartographer and encounter designer working inside a dungeon map editor.

RULES
- Reply with ONE JSON object and nothing else. No markdown fences, no prose outside the JSON.
- Coordinates are GRID CELLS (integers), origin 0,0, everything within -40..40.
- Rooms are axis-aligned, never overlap, and every room is reachable: connect them with corridors whose
  endpoints touch a room edge. Corridors are straight (share x1==x2 or y1==y2); use two segments for an L.
- Think about play: vary room sizes (3x3 up to 12x9), add a clear entrance room, at least one dead end or
  secret area when the request allows, and place doors where corridors meet rooms.
- Names are short and evocative ("Flooded Shrine", not "Room 1").
- Keep every array under 14 items.

SHAPE
{
  "notes": "2-4 sentence GM-facing explanation of the layout and how to run it",
  "rooms": [{"x":0,"y":0,"w":6,"h":4,"name":"Guard post"}],
  "corridors": [{"x1":0,"y1":0,"x2":10,"y2":0}],
  "objects": [{"kind":"door","x":6,"y":2},{"kind":"npc","x":3,"y":2,"name":"Goblin sentry"},
              {"kind":"light","x":4,"y":2},{"kind":"trigger","x":8,"y":5,"name":"Pit trap"},
              {"kind":"item","x":2,"y":3,"name":"Iron chest"},{"kind":"text","x":3,"y":1,"text":"Barracks"}],
  "encounters": [{"name":"...","description":"stat-light description a GM can read aloud plus tactics"}],
  "settings": {}
}

MODES
- "rooms": full layout — rooms + corridors + doors/lights/labels, few or no encounters.
- "encounter": rooms/corridors/objects empty, fill "encounters" richly and tie them to existing rooms in the summary.
- "hatching": rooms/corridors/objects empty, only tune "settings" and explain the look in "notes".
- "refine": modify the existing map described in the summary — only return the NEW rooms/corridors/objects to add,
  and use "settings" for restyling. Never repeat geometry that already exists.

"settings" may only contain: hatch (boolean), hatchDensity (3-16), roughness (0-14), wallThickness (2-16),
gridStyle ("square"|"dot"|"hex"|"none"), bgColor, floorColor, wallColor, gridColor, inkColor (hex strings).
Never invent other keys.`;

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

function parseJson(text: string): AiSuggestion {
  const raw = JSON.parse(extractJson(text)) as Partial<AiSuggestion>;
  const rooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  const objects = Array.isArray(raw.objects) ? raw.objects : [];
  return {
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
    encounters: (Array.isArray(raw.encounters) ? raw.encounters : []).slice(0, 20).map((e) => ({
      name: String(e?.name ?? "Encounter").slice(0, 80),
      description: String(e?.description ?? "").slice(0, 600),
    })),
    settings: raw.settings && typeof raw.settings === "object" ? (raw.settings as Record<string, string | number | boolean>) : {},
  };
}

export const suggestMap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<AiSuggestion> => {
    const engine = AI_ENGINES[data.engine];
    const isCustom = "custom" in engine && engine.custom === true;
    const { createLovableAiGatewayProvider, createCustomProvider } = await import("./ai-gateway.server");

    let model;
    let providerOptions: { lovable: { reasoningEffort: string } } | undefined;
    if (isCustom) {
      const customKey = process.env["CONDUIT_API_KEY"];
      if (!customKey) throw new Error("Custom AI endpoint is not configured — add the CONDUIT_API_KEY secret.");
      const baseURL = process.env["CONDUIT_BASE_URL"] || "https://conduit.ozdoev.net/v1";
      const modelId = process.env["CONDUIT_MODEL"] || engine.id;
      model = createCustomProvider(customKey, baseURL)(modelId);
    } else {
      const key = process.env["LOVABLE_API_KEY"];
      if (!key) throw new Error("AI is not configured");
      const modelId = engine.id;
      model = createLovableAiGatewayProvider(key)(modelId);
      // GPT-5.6 models must run with reasoning explicitly off on chat completions.
      if (modelId.startsWith("openai/gpt-5.6")) providerOptions = { lovable: { reasoningEffort: "none" } };
    }

    const userTurn = [
      `Mode: ${data.mode}`,
      `Grid cell size: ${data.gridSize}px`,
      `Current map: ${data.summary || "(empty map)"}`,
      "",
      `Request: ${data.prompt}`,
    ].join("\n");

    const messages = [
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userTurn },
    ];

    // Streamed so long generations keep bytes flowing; we still consume it as one shot.
    const run = async (extra?: string) => {
      const result = streamText({
        model,
        ...(providerOptions ? { providerOptions } : {}),
        system: extra ? `${SYSTEM}\n\n${extra}` : SYSTEM,
        messages: (extra
          ? [...messages, { role: "user" as const, content: extra }]
          : messages) as { role: "user" | "assistant"; content: string }[],
      });
      return await result.text;
    };


    let text = "";
    try {
      text = await run();
      return parseJson(text);
    } catch (err) {
      if (err instanceof SyntaxError || (err as Error)?.message === "no json") {
        try {
          // One repair pass: the model saw its own malformed reply is unusable.
          return parseJson(await run("Your previous reply was not valid JSON. Reply again with ONLY the JSON object."));
        } catch {
          return { notes: text.slice(0, 800), rooms: [], corridors: [], objects: [], encounters: [], settings: {} };
        }
      }
      const msg = (err as Error)?.message ?? "AI request failed";
      if (msg.includes("429")) throw new Error("429 Too many AI requests — wait a moment and try again.");
      if (msg.includes("402")) throw new Error("402 AI credits exhausted — add credits to keep generating.");
      throw new Error(msg);
    }
  });
