/** Tiny image cache so the canvas renderer can draw uploaded props synchronously. */
const cache = new Map<string, HTMLImageElement>();
const pending = new Set<string>();
const listeners = new Set<() => void>();

export function onImageLoaded(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getImage(url: string): HTMLImageElement | null {
  if (typeof window === "undefined" || !url) return null;
  const hit = cache.get(url);
  if (hit) return hit.complete && hit.naturalWidth > 0 ? hit : null;
  if (pending.has(url)) return null;
  pending.add(url);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    cache.set(url, img);
    pending.delete(url);
    listeners.forEach((fn) => fn());
  };
  img.onerror = () => pending.delete(url);
  img.src = url;
  return null;
}

export function preloadImages(urls: string[]) {
  urls.forEach((u) => getImage(u));
}
