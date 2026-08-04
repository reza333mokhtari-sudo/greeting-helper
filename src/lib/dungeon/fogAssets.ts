/**
 * 2D fog asset library.
 *
 * Each style is a seeded, procedurally painted sprite sheet that tiles
 * seamlessly, so fog reads as painted clouds / smoke / ink instead of a flat
 * fill. Tiles are cached per (style, colour, size).
 */

export type FogStyle = "solid" | "cloud" | "smoke" | "ink" | "hatch" | "mist";

export const FOG_STYLES: { id: FogStyle; label: string; hint: string }[] = [
  { id: "cloud", label: "Cloud", hint: "Soft rolling cloud bank" },
  { id: "smoke", label: "Smoke", hint: "Wispy drifting smoke" },
  { id: "mist", label: "Mist", hint: "Thin luminous haze" },
  { id: "ink", label: "Ink", hint: "Blotted ink wash" },
  { id: "hatch", label: "Hatch", hint: "Hand-drawn cross hatch" },
  { id: "solid", label: "Solid", hint: "Flat opaque fill" },
];

const TILE = 256;
const cache = new Map<string, HTMLCanvasElement>();

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function rgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return { r: 8, g: 10, b: 18 };
  return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16) };
}

function lift(hex: string, amount: number) {
  const { r, g, b } = rgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

/** Draw a puff at (x,y), wrapping across tile edges so the sheet tiles. */
function puff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  for (const dx of [-TILE, 0, TILE]) {
    for (const dy of [-TILE, 0, TILE]) {
      const cx = x + dx;
      const cy = y + dy;
      if (cx < -r || cy < -r || cx > TILE + r || cy > TILE + r) continue;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, color);
      g.addColorStop(0.55, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function paint(style: FogStyle, color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  const ctx = c.getContext("2d")!;
  const rand = rng(style.length * 9176 + 7);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, TILE, TILE);

  if (style === "solid") return c;

  if (style === "cloud" || style === "mist") {
    const puffs = style === "cloud" ? 26 : 34;
    const hi = lift(color, style === "cloud" ? 0.22 : 0.34);
    const lo = lift(color, -0.0);
    for (let i = 0; i < puffs; i++) {
      const r = (style === "cloud" ? 40 : 26) + rand() * 62;
      puff(ctx, rand() * TILE, rand() * TILE, r, hi, style === "cloud" ? 0.22 : 0.16);
    }
    for (let i = 0; i < puffs / 2; i++) {
      puff(ctx, rand() * TILE, rand() * TILE, 30 + rand() * 70, lo, 0.35);
    }
    return c;
  }

  if (style === "smoke") {
    const hi = lift(color, 0.28);
    ctx.lineCap = "round";
    for (let i = 0; i < 22; i++) {
      const x = rand() * TILE;
      const y = rand() * TILE;
      ctx.globalAlpha = 0.06 + rand() * 0.1;
      ctx.strokeStyle = hi;
      ctx.lineWidth = 8 + rand() * 26;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 60 - rand() * 120, y - 60, x + 90 - rand() * 60, y + 70, x + 120 - rand() * 240, y + 110);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 14; i++) puff(ctx, rand() * TILE, rand() * TILE, 40 + rand() * 60, hi, 0.08);
    return c;
  }

  if (style === "ink") {
    const dark = lift(color, -0.1);
    const hi = lift(color, 0.16);
    for (let i = 0; i < 16; i++) {
      const x = rand() * TILE;
      const y = rand() * TILE;
      const r = 22 + rand() * 46;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = i % 3 === 0 ? hi : dark;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 12) {
        const rr = r * (0.72 + rand() * 0.5);
        const px = x + Math.cos(a) * rr;
        const py = y + Math.sin(a) * rr;
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return c;
  }

  // hatch
  const line = lift(color, 0.3);
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.35;
  for (let i = -TILE; i < TILE * 2; i += 9) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + TILE, TILE);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.2;
  for (let i = -TILE; i < TILE * 2; i += 11) {
    ctx.beginPath();
    ctx.moveTo(i + TILE, 0);
    ctx.lineTo(i, TILE);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return c;
}

/** Cached tile sheet for a style + fog colour. */
export function fogTile(style: FogStyle, color: string): HTMLCanvasElement {
  const key = `${style}|${color}`;
  let t = cache.get(key);
  if (!t) {
    t = paint(style, color);
    cache.set(key, t);
  }
  return t;
}

/** Small preview image for the style picker. */
export function fogThumbnail(style: FogStyle, color: string): string {
  const tile = fogTile(style, color);
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 48;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(tile, 0, 0, TILE, TILE / 2, 0, 0, 96, 48);
  return c.toDataURL("image/png");
}
