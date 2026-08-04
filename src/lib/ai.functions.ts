import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  prompt: z.string().min(1).max(2000),
  /** Compact description of the current map so the model can refine it. */
  summary: z.string().max(4000).default(""),
  mode: z.enum(["rooms", "encounter", "hatching", "refine"]).default("rooms"),
  gridSize: z.number().positive().default(32),
});

export type AiRoom = { x: number; y: number; w: number; h: number; name?: string };
export type AiSuggestion = {
  notes: string;
  rooms: AiRoom[];
  corridors: { x1: number; y1: number; x2: number; y2: number }[];
  encounters: { name: string; description: string }[];
  settings: Record<string, string | number | boolean>;
};

const SYSTEM = `You are a veteran TTRPG cartographer assisting inside a dungeon map editor.
Always answer with ONE JSON object and nothing else (no markdown fences).
Shape:
{
  "notes": "short GM-facing explanation",
  "rooms": [{"x":0,"y":0,"w":6,"h":4,"name":"Guard post"}],
  "corridors": [{"x1":0,"y1":0,"x2":10,"y2":0}],
  "encounters": [{"name":"...","description":"..."}],
  "settings": {}
}
Coordinates are in GRID CELLS (integers), origin 0,0, keep everything within -40..40.
Rooms must not overlap and should be connected by corridors.
"settings" may only contain these optional keys: hatch (boolean), hatchDensity (number 3-16),
roughness (number 0-14), wallThickness (number 2-16), gridStyle ("square"|"dot"|"hex"|"none"),
bgColor, floorColor, wallColor, gridColor, inkColor (hex strings).
For mode "hatching" return an empty rooms array and only tune "settings" + notes.
For mode "encounter" return an empty rooms array and fill "encounters".
Keep arrays under 14 items. Never invent other keys.`;

function parseJson(text: string): AiSuggestion {
  const cleaned = text.replace(/^[\s\S]*?\{/, "{").replace(/\}[^}]*$/, "}");
  const raw = JSON.parse(cleaned) as Partial<AiSuggestion>;
  return {
    notes: typeof raw.notes === "string" ? raw.notes : "",
    rooms: Array.isArray(raw.rooms) ? raw.rooms.slice(0, 20) : [],
    corridors: Array.isArray(raw.corridors) ? raw.corridors.slice(0, 20) : [],
    encounters: Array.isArray(raw.encounters) ? raw.encounters.slice(0, 20) : [],
    settings: raw.settings && typeof raw.settings === "object" ? (raw.settings as Record<string, string | number | boolean>) : {},
  };
}

export const suggestMap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<AiSuggestion> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const result = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      system: SYSTEM,
      prompt: `Mode: ${data.mode}\nGrid cell size: ${data.gridSize}px\nCurrent map: ${data.summary || "(empty map)"}\n\nRequest: ${data.prompt}`,
    });

    try {
      return parseJson(result.text);
    } catch {
      return { notes: result.text.slice(0, 800), rooms: [], corridors: [], encounters: [], settings: {} };
    }
  });
