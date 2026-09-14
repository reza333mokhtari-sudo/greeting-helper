import { useEffect, useState } from "react";

const STORAGE_KEY = "snapgram:instagram-mode";
const EVENT = "snapgram:instagram-mode-change";

export function readInstagramMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "on";
}

export function setInstagramMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Instagram layout mode. Client-side preference so the whole shell can switch
 * between the plain Snapgram layout and the Instagram-style layout.
 */
export function useInstagramMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(readInstagramMode());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("ig-mode", enabled);
  }, [enabled]);

  return { enabled, setEnabled: setInstagramMode };
}
