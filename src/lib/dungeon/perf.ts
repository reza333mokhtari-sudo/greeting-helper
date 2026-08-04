/** Lightweight rolling performance sampler for the canvas render loop. */

const MAX = 120;
const frameGaps: number[] = [];
const drawTimes: number[] = [];
let lastFrame = 0;
let totalFrames = 0;
let longFrames = 0;

/** Record one completed render pass, `ms` = time spent inside renderScene. */
export function recordDraw(ms: number) {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (lastFrame) {
    const gap = now - lastFrame;
    frameGaps.push(gap);
    if (frameGaps.length > MAX) frameGaps.shift();
    if (gap > 33) longFrames += 1;
  }
  lastFrame = now;
  totalFrames += 1;
  drawTimes.push(ms);
  if (drawTimes.length > MAX) drawTimes.shift();
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export type PerfStats = {
  fps: number;
  frameMs: number;
  drawMs: number;
  drawMaxMs: number;
  totalFrames: number;
  longFrames: number;
  heapMb: number | null;
  dpr: number;
};

export function readPerf(): PerfStats {
  const frameMs = avg(frameGaps);
  const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  return {
    fps: frameMs > 0 ? Math.min(240, 1000 / frameMs) : 0,
    frameMs,
    drawMs: avg(drawTimes),
    drawMaxMs: drawTimes.length ? Math.max(...drawTimes) : 0,
    totalFrames,
    longFrames,
    heapMb: mem ? mem.usedJSHeapSize / 1048576 : null,
    dpr: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1,
  };
}

export function resetPerf() {
  frameGaps.length = 0;
  drawTimes.length = 0;
  lastFrame = 0;
  totalFrames = 0;
  longFrames = 0;
}
