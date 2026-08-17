import { type Doc, type Pt, uid, DEFAULT_LAYER_FOR, type Shape, type MapObject } from "../model";

export type RoomTemplate = {
  w: number;
  h: number;
  name: string;
};

/**
 * Generates a simple rectangular room at the specified position.
 */
export function generateRoom(doc: Doc, pos: Pt, template: RoomTemplate): Doc {
  const { gridSize } = doc.settings;
  const shapes: Shape[] = [...doc.shapes];
  const objects: MapObject[] = [...doc.objects];
  const noteLayer =
    doc.layers.find((l) => l.id === DEFAULT_LAYER_FOR.text)?.id ?? doc.layers[0]!.id;

  const a = { x: pos.x, y: pos.y };
  const b = { x: pos.x + template.w * gridSize, y: pos.y + template.h * gridSize };

  shapes.push({
    id: uid("s"),
    kind: "rect",
    erase: false,
    a,
    b,
  });

  if (template.name) {
    objects.push({
      id: uid("o"),
      layerId: noteLayer,
      kind: "text",
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      text: template.name,
      size: Math.max(12, gridSize * 0.5),
    });
  }

  return { ...doc, shapes, objects };
}

/**
 * Procedurally generates a corridor between two points.
 */
export function generateCorridor(doc: Doc, start: Pt, end: Pt, width: number = 1): Doc {
  const { gridSize } = doc.settings;
  const id = uid("s");

  // Simple L-shaped corridor
  const newShape = {
    id,
    kind: "poly" as const,
    erase: false,
    pts: [
      { x: start.x, y: start.y },
      { x: end.x, y: start.y },
      { x: end.x, y: end.y },
    ],
  };

  return {
    ...doc,
    shapes: [...doc.shapes, newShape],
  };
}
