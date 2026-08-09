import { type Doc, type Pt, uid, DEFAULT_LAYER_FOR } from "../model";

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
  const id = uid("s");
  
  const newShape = {
    id,
    kind: "rect" as const,
    erase: false,
    a: { x: pos.x, y: pos.y },
    b: { x: pos.x + template.w * gridSize, y: pos.y + template.h * gridSize },
  };

  return {
    ...doc,
    shapes: [...doc.shapes, newShape],
  };
}

/**
 * Procedurally generates a corridor between two points.
 */
export function generateCorridor(doc: Doc, start: Pt, end: Pt, width: number = 1): Doc {
  const { gridSize } = doc.settings;
  const id = uid("s");
  
  // Simple L-shaped corridor or straight line
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
