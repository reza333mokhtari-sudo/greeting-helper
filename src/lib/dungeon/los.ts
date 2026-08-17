import type { Doc, MapObject, Pt, Shape } from "./model";

export type Seg = { a: Pt; b: Pt };

function ring(pts: Pt[]): Seg[] {
  const segs: Seg[] = [];
  for (let i = 0; i < pts.length; i++) segs.push({ a: pts[i]!, b: pts[(i + 1) % pts.length]! });
  return segs;
}

function ellipsePts(cx: number, cy: number, rx: number, ry: number, n = 24): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry };
  });
}

function shapeOutline(s: Shape): Pt[] | null {
  if (s.kind === "rect") {
    const x1 = Math.min(s.a.x, s.b.x);
    const x2 = Math.max(s.a.x, s.b.x);
    const y1 = Math.min(s.a.y, s.b.y);
    const y2 = Math.max(s.a.y, s.b.y);
    return [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 },
      { x: x1, y: y2 },
    ];
  }
  if (s.kind === "ellipse") {
    return ellipsePts(
      (s.a.x + s.b.x) / 2,
      (s.a.y + s.b.y) / 2,
      Math.abs(s.b.x - s.a.x) / 2,
      Math.abs(s.b.y - s.a.y) / 2,
    );
  }
  if (s.kind === "poly") return s.pts.length > 2 ? s.pts : null;
  return null; // brush corridors are open passages: they do not block sight
}

/** Wall segments used as sight/light occluders. */
export function occluders(doc: Doc): Seg[] {
  const segs: Seg[] = [];
  for (const s of doc.shapes) {
    if (s.erase) continue;
    const out = shapeOutline(s);
    if (out) segs.push(...ring(out));
  }
  for (const o of doc.objects) {
    if (o.kind === "pillar") segs.push(...ring(ellipsePts(o.x, o.y, o.r, o.r, 10)));
    if (o.kind === "door" && o.blocksLight) {
      const dx = (Math.cos(o.angle) * o.size) / 2;
      const dy = (Math.sin(o.angle) * o.size) / 2;
      segs.push({ a: { x: o.x - dx, y: o.y - dy }, b: { x: o.x + dx, y: o.y + dy } });
    }
  }
  return segs;
}

function rayHit(origin: Pt, dx: number, dy: number, segs: Seg[], maxDist: number): Pt {
  let best = maxDist;
  for (const s of segs) {
    const sx = s.b.x - s.a.x;
    const sy = s.b.y - s.a.y;
    const denom = dx * sy - dy * sx;
    if (Math.abs(denom) < 1e-9) continue;
    const t2 = ((s.a.x - origin.x) * dy - (s.a.y - origin.y) * dx) / denom;
    if (t2 < 0 || t2 > 1) continue;
    const t1 =
      Math.abs(dx) > Math.abs(dy)
        ? (s.a.x + sx * t2 - origin.x) / dx
        : (s.a.y + sy * t2 - origin.y) / dy;

    if (t1 > 0.0001 && t1 < best) best = t1;
  }
  return { x: origin.x + dx * best, y: origin.y + dy * best };
}

/**
 * Visibility polygon from `origin`, limited to `radius`.
 * Casts rays at every occluder endpoint (plus small offsets) and fills the
 * gaps with a coarse radial fan so circular falloff stays smooth.
 */
export function visibilityPolygon(origin: Pt, radius: number, segs: Seg[]): Pt[] {
  const near = segs.filter((s) => {
    // distance from the light to the segment itself, so long walls are kept
    const vx = s.b.x - s.a.x;
    const vy = s.b.y - s.a.y;
    const len2 = vx * vx + vy * vy || 1;
    let t = ((origin.x - s.a.x) * vx + (origin.y - s.a.y) * vy) / len2;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(s.a.x + vx * t - origin.x, s.a.y + vy * t - origin.y);
    return d < radius * 1.6;
  });

  const angles: number[] = [];
  for (const s of near) {
    for (const p of [s.a, s.b]) {
      const a = Math.atan2(p.y - origin.y, p.x - origin.x);
      angles.push(a - 0.0004, a, a + 0.0004);
    }
  }
  const fan = 64;
  for (let i = 0; i < fan; i++) angles.push((i / fan) * Math.PI * 2 - Math.PI);
  angles.sort((a, b) => a - b);
  return angles.map((a) => rayHit(origin, Math.cos(a), Math.sin(a), near, radius));
}

export function lightSources(doc: Doc): MapObject[] {
  const visible = new Set(doc.layers.filter((l) => l.visible).map((l) => l.id));
  return doc.objects.filter((o) => o.kind === "light" && visible.has(o.layerId));
}
