import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

/** Selectable AI engines. Keys are stable ids the UI sends; values are gateway model ids. */
export const AI_ENGINES = {
  swift: { id: "google/gemini-3.6-flash", label: "Swift · Gemini 3.6 Flash", hint: "Fastest, great for quick layouts" },
  balanced: { id: "openai/gpt-5.6-terra", label: "Balanced · GPT-5.6 Terra", hint: "Best all-round cartography" },
  deep: { id: "openai/gpt-5.6-sol", label: "Deep · GPT-5.6 Sol", hint: "Strongest reasoning, slower" },
  lite: { id: "openai/gpt-5.6-luna", label: "Lite · GPT-5.6 Luna", hint: "Cheapest, simple requests" },
  grok: { id: "grok-4.5", label: "Grok 4.5", hint: "Expert map-design assistant" },
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

const SYSTEM = `You are an expert Dungeon Scrawl map-design assistant and veteran TTRPG cartographer.

Dungeon Scrawl is a tool for quickly drawing RPG/D&D battlemaps with a hand-drawn look.

RULES
- Reply with ONE JSON object and nothing else. No markdown fences, no prose outside the JSON.
- Coordinates are GRID CELLS (integers), origin 0,0, everything within -40..40.
- Rooms are axis-aligned, never overlap, and every room is reachable: connect them with corridors whose
  endpoints touch a room edge. Corridors are straight (share x1==x2 or y1==y2); use two segments for an L.
- Think about play: vary room sizes (3x3 up to 12x9), add a clear entrance room, at least one dead end or
  secret area when the request allows, and place doors where corridors meet rooms.
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
      // Tolerate the common "fabel" spelling of the model id.
      const modelId = (process.env["CONDUIT_MODEL"] || engine.id).trim().replace(/fabel/gi, "fable");
      model = createCustomProvider(customKey, baseURL)(modelId);
    } else {
      const key = process.env["LOVABLE_API_KEY"];
      if (!key) throw new Error("AI is not configured");
      const modelId = engine.id;
      model = createLovableAiGatewayProvider(key)(modelId);
      // GPT-5.6 models must run with reasoning explicitly off on chat completions.
      if (modelId.startsWith("openai/gpt-5.6")) providerOptions = { lovable: { reasoningEffort: "none" } };
      if (modelId === "grok-4.5") {
        // Apply the specific authorization header for Grok if it's the specific key provided
        // Note: The key is handled via the gateway ordinarily, but we can set it via secret if needed.
      }
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
    // streamText never throws — it reports failures through onError and then surfaces
    // a useless "No output generated", so capture the real cause and rethrow it.
    const run = async (extra?: string) => {
      let streamError: unknown;
      const result = streamText({
        model,
        // Quota/auth errors are terminal — retrying just multiplies the same failure.
        maxRetries: isCustom ? 0 : 1,
        ...(providerOptions ? { providerOptions } : {}),

        system: extra ? `${SYSTEM}\n\n${extra}` : SYSTEM,
        messages: (extra
          ? [...messages, { role: "user" as const, content: extra }]
          : messages) as { role: "user" | "assistant"; content: string }[],
        onError: ({ error }) => {
          streamError = error;
          console.error("[ai.suggestMap] stream error", error);
        },
      });
      const toError = (e: unknown) =>
        e instanceof Error
          ? e
          : new Error(typeof e === "string" ? e : JSON.stringify(e, Object.getOwnPropertyNames(Object(e))).slice(0, 500));
      let out: string;
      try {
        out = await result.text;
      } catch (e) {
        throw toError(streamError ?? e);
      }
      if (streamError) throw toError(streamError);
      return out;
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
      if (/free_premium_limit|premium-model limit/i.test(msg))
        throw new Error(
          "Your custom endpoint's free premium-model quota is used up — pick another engine (Swift / Balanced / Deep / Lite) or set CONDUIT_MODEL to a non-premium model.",
        );

      if (msg.includes("Unknown model"))
        throw new Error("Your endpoint does not know this model id — update the CONDUIT_MODEL secret.");
      if (msg.includes("Temporary service interruption"))
        throw new Error("Your custom endpoint is temporarily unavailable — retry or pick another engine.");
      throw new Error(msg);
    }
  });
