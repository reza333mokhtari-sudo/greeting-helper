import { docBounds, objectsInDrawOrder, type Doc, type MapObject } from "./model";
import { lightSources, occluders, visibilityPolygon } from "./los";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, 'Segoe UI', sans-serif";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const n = (v: number) => Math.round(v * 100) / 100;

function shapeGeom(s: Doc["shapes"][number], stroke: number, color: string): string {
  const common = `fill="${color}" stroke="${color}" stroke-width="${n(stroke)}" stroke-linejoin="round" stroke-linecap="round"`;
  if (s.kind === "rect") {
    const x = Math.min(s.a.x, s.b.x);
    const y = Math.min(s.a.y, s.b.y);
    return `<rect x="${n(x)}" y="${n(y)}" width="${n(Math.abs(s.b.x - s.a.x))}" height="${n(Math.abs(s.b.y - s.a.y))}" ${common}/>`;
  }
  if (s.kind === "ellipse") {
    return `<ellipse cx="${n((s.a.x + s.b.x) / 2)}" cy="${n((s.a.y + s.b.y) / 2)}" rx="${n(Math.abs(s.b.x - s.a.x) / 2)}" ry="${n(Math.abs(s.b.y - s.a.y) / 2)}" ${common}/>`;
  }
  if (s.kind === "poly") {
    return `<polygon points="${s.pts.map((p) => `${n(p.x)},${n(p.y)}`).join(" ")}" ${common}/>`;
  }
  const d = s.pts.map((p, i) => `${i ? "L" : "M"}${n(p.x)} ${n(p.y)}`).join(" ");
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${n(s.width + stroke)}" stroke-linejoin="round" stroke-linecap="round"/>`;
}

function maskBody(doc: Doc, stroke: number): string {
  return doc.shapes.map((s) => shapeGeom(s, stroke, s.erase ? "#000000" : "#ffffff")).join("");
}

function objectSvg(o: MapObject, doc: Doc, extraScale: number = 1): string {
  const { wallColor, floorColor, inkColor } = doc.settings;
  const rot = o.kind === "door" || o.kind === "stairs" ? ` rotate(${n((o.angle * 180) / Math.PI)})` : "";
  const open = `<g transform="translate(${n(o.x)} ${n(o.y)})${rot} scale(${n(extraScale)})">`;
  const text = (t: string, y: number, size: number, fill: string, weight = 600) =>
    t
      ? `<text x="0" y="${n(y)}" font-family="${FONT}" font-size="${n(size)}" font-weight="${weight}" fill="${fill}" text-anchor="middle" dominant-baseline="middle">${esc(t)}</text>`
      : "";

  let body = "";
  if (o.kind === "door") {
    const s = o.size;
    const t = Math.max(6, doc.settings.wallThickness * 1.6);
    const sw = Math.max(2, doc.settings.wallThickness * 0.5);
    body = `<rect x="${n(-s / 2)}" y="${n(-t / 2)}" width="${n(s)}" height="${n(t)}" fill="${floorColor}" stroke="${wallColor}" stroke-width="${n(sw)}"/>`;
    if (o.variant === "double") body += `<line x1="0" y1="${n(-t / 2)}" x2="0" y2="${n(t / 2)}" stroke="${wallColor}" stroke-width="${n(sw)}"/>`;
    if (o.variant === "secret") body += text("S", 0, s * 0.55, wallColor, 700);
    if (o.variant === "archway")
      body = `<rect x="${n(-s / 2)}" y="${n(-t / 2)}" width="${n(s)}" height="${n(t)}" fill="${floorColor}"/><line x1="${n(-s / 2)}" y1="${n(-t / 2)}" x2="${n(-s / 2)}" y2="${n(t / 2)}" stroke="${wallColor}" stroke-width="${n(sw)}"/><line x1="${n(s / 2)}" y1="${n(-t / 2)}" x2="${n(s / 2)}" y2="${n(t / 2)}" stroke="${wallColor}" stroke-width="${n(sw)}"/>`;
  } else if (o.kind === "stairs") {
    const w = o.size;
    const sw = Math.max(1.5, doc.settings.wallThickness * 0.35);
    body = `<rect x="${n(-w / 2)}" y="${n(-w / 2)}" width="${n(w)}" height="${n(w)}" fill="${floorColor}" stroke="${wallColor}" stroke-width="${n(sw)}"/>`;
    for (let i = 1; i < o.steps; i++) {
      const y = -w / 2 + (i * w) / o.steps;
      body += `<line x1="${n(-w / 2)}" y1="${n(y)}" x2="${n(w / 2)}" y2="${n(y)}" stroke="${wallColor}" stroke-width="${n(sw)}"/>`;
    }
  } else if (o.kind === "pillar") {
    body = `<circle r="${n(o.r)}" fill="${wallColor}"/>`;
  } else if (o.kind === "npc") {
    body =
      `<circle r="${n(o.r)}" fill="${o.color}" stroke="${o.hostile ? "#2b0b0b" : "#0b1b2b"}" stroke-width="${n(Math.max(1.5, o.r * 0.14))}"/>` +
      (o.hostile ? `<circle r="${n(o.r * 1.28)}" fill="none" stroke="${o.color}" stroke-width="1.5" stroke-dasharray="${n(o.r * 0.4)} ${n(o.r * 0.3)}"/>` : "") +
      text(o.label || o.name || "", 0, o.r * 0.9, "#ffffff");
  } else if (o.kind === "item") {
    const s = o.size;
    body =
      `<polygon points="0,${n(-s / 2)} ${n(s / 2)},0 0,${n(s / 2)} ${n(-s / 2)},0" fill="${o.color}" stroke="${inkColor}" stroke-width="${n(Math.max(1.2, s * 0.08))}"/>` +
      text(o.label || o.name || "", s * 0.95, s * 0.45, inkColor);
  } else if (o.kind === "trigger") {
    body =
      `<rect x="${n(-o.w / 2)}" y="${n(-o.h / 2)}" width="${n(o.w)}" height="${n(o.h)}" fill="${o.color}" fill-opacity="0.2" stroke="${o.color}" stroke-width="2" stroke-dasharray="8 6"/>` +
      text((o.label || o.name || o.trigger).toUpperCase(), 0, Math.max(10, Math.min(o.w, o.h) * 0.22), o.color);
  } else if (o.kind === "light") {
    body = `<circle r="6" fill="${o.color}"/>`;
  } else if (o.kind === "image") {
    body = `<image x="${n(-o.w / 2)}" y="${n(-o.h / 2)}" width="${n(o.w)}" height="${n(o.h)}" href="${o.url}" preserveAspectRatio="none"/>`;
  } else {
    body = text(o.text, 0, o.size, inkColor);
  }
  return `${open}${body}</g>`;
}

export function docToSvg(doc: Doc, pad = 60): string {
  const b = docBounds(doc) ?? { x1: 0, y1: 0, x2: 400, y2: 300 };
  const x = b.x1 - pad;
  const y = b.y1 - pad;
  const w = Math.max(64, b.x2 - b.x1 + pad * 2);
  const h = Math.max(64, b.y2 - b.y1 + pad * 2);
  const s = doc.settings;
  const t = s.wallThickness;

  const gridDef =
    s.gridStyle === "none"
      ? ""
      : s.gridStyle === "square"
        ? `<pattern id="grid" width="${n(s.gridSize)}" height="${n(s.gridSize)}" patternUnits="userSpaceOnUse"><path d="M ${n(s.gridSize)} 0 L 0 0 0 ${n(s.gridSize)}" fill="none" stroke="${s.gridColor}" stroke-width="1"/></pattern>`
        : `<pattern id="grid" width="${n(s.gridSize)}" height="${n(s.gridSize)}" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r="1.6" fill="${s.gridColor}"/></pattern>`;

  const layerById = new Map(doc.layers.map((l) => [l.id, l]));
  const globalObjScale = s.objectRenderScale || 1;
  const objs = objectsInDrawOrder(doc)
    .filter((o) => (layerById.get(o.layerId)?.visible ?? true) && o.kind !== "light")
    .map((o) => {
      const l = layerById.get(o.layerId);
      const op = l && l.opacity < 1 ? ` opacity="${n(l.opacity)}"` : "";
      return `<g${op} data-layer="${esc(l?.name ?? "")}">${objectSvg(o, doc, globalObjScale)}</g>`;
    })
    .join("");

  // lighting / line of sight
  let fog = "";
  let fogDefs = "";
  const lights = lightSources(doc);
  if ((s.lighting || s.losMode !== "off") && lights.length) {
    const segs = occluders(doc);
    let maskInner = `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="#ffffff"/>`;
    let glow = "";
    lights.forEach((l, i) => {
      if (l.kind !== "light") return;
      const poly = visibilityPolygon({ x: l.x, y: l.y }, l.radius, segs);
      if (poly.length < 3) return;
      const pts = poly.map((p) => `${n(p.x)},${n(p.y)}`).join(" ");
      fogDefs += `<radialGradient id="lg${i}" gradientUnits="userSpaceOnUse" cx="${n(l.x)}" cy="${n(l.y)}" r="${n(l.radius)}"><stop offset="0" stop-color="#000" stop-opacity="${n(Math.min(1, l.intensity))}"/><stop offset="0.65" stop-color="#000" stop-opacity="${n(Math.min(1, l.intensity) * 0.8)}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`;
      fogDefs += `<radialGradient id="lc${i}" gradientUnits="userSpaceOnUse" cx="${n(l.x)}" cy="${n(l.y)}" r="${n(l.radius)}"><stop offset="0" stop-color="${l.color}" stop-opacity="${n(Math.min(0.7, l.intensity * 0.55))}"/><stop offset="1" stop-color="${l.color}" stop-opacity="0"/></radialGradient>`;
      maskInner += `<polygon points="${pts}" fill="url(#lg${i})"/>`;
      if (s.lighting) glow += `<polygon points="${pts}" fill="url(#lc${i})"/>`;
    });
    fogDefs += `<mask id="fogmask">${maskInner}</mask>`;
    fog = `${glow}<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${s.fogColor}" fill-opacity="${n(1 - Math.min(0.95, Math.max(0, s.ambient)))}" mask="url(#fogmask)"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(w)}" height="${n(h)}" viewBox="${n(x)} ${n(y)} ${n(w)} ${n(h)}">
<defs>
<mask id="wallmask">${maskBody(doc, t * 2)}</mask>
<mask id="floormask">${maskBody(doc, 0)}</mask>
${gridDef}${fogDefs}
</defs>
<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${s.bgColor}"/>
<g mask="url(#wallmask)"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${s.wallColor}"/></g>
<g mask="url(#floormask)"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${s.floorColor}"/>${gridDef ? `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="url(#grid)"/>` : ""}</g>
${objs}
${fog}
</svg>`;
}

function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function exportSvgFile(doc: Doc, filename = "dungeon-map.svg") {
  download(new Blob([docToSvg(doc)], { type: "image/svg+xml" }), filename);
}

export async function exportPdfFile(doc: Doc, filename = "dungeon-map.pdf") {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import("jspdf"), import("svg2pdf.js")]);
  const svg = docToSvg(doc);
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.innerHTML = svg;
  document.body.appendChild(host);
  const el = host.firstElementChild as SVGSVGElement;
  const w = Number(el.getAttribute("width"));
  const h = Number(el.getAttribute("height"));
  const pdf = new jsPDF({ orientation: w >= h ? "landscape" : "portrait", unit: "pt", format: [w, h] });
  try {
    await svg2pdf(el, pdf, { x: 0, y: 0, width: w, height: h });
    pdf.save(filename);
  } finally {
    host.remove();
  }
}
